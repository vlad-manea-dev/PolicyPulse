#!/usr/bin/env bun
/**
 * For each TD in data/roster.json, fetches 50 recent + 50 older Dáil speeches
 * from KildareStreet and caches to data/raw/{id}.json.
 *
 * Runs 5 concurrent slots with 200ms delay between requests per slot.
 * On 429 or parse error: doubles delay, retries once, then skips.
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import type { RosterEntry } from "./fetch-roster";

const KS_KEY = process.env.KILDARESTREET_API_KEY;
if (!KS_KEY) throw new Error("Set KILDARESTREET_API_KEY env var");

const KS_BASE = "https://www.kildarestreet.com/api";
const CONCURRENCY = 5;
const BASE_DELAY = 200;

interface Debate {
  date: string;
  body: string;
  gid: string;
}

interface RawFile {
  id: string;
  name: string;
  recent: Debate[];
  older: Debate[];
  error?: string;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function ksGet(url: string): Promise<any> {
  const proc = Bun.spawn(["curl", "-sL", "-w", "\n%{http_code}", url], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const raw = await new Response(proc.stdout).text();
  const lastNl = raw.lastIndexOf("\n");
  const status = parseInt(raw.slice(lastNl + 1).trim(), 10);
  const body = raw.slice(0, lastNl).trim();
  return { status, data: JSON.parse(body) };
}

function parseRows(rows: any): Debate[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r: any) => r.body && r.hdate)
    .map((r: any) => ({
      date: r.hdate as string,
      body: (r.body as string).replace(/&amp;/g, "&").replace(/<[^>]+>/g, "").trim(),
      gid: r.gid as string,
    }))
    .filter((d: Debate) => d.body.split(/\s+/).length >= 30);
}

async function fetchTD(td: RosterEntry): Promise<void> {
  const outPath = `data/raw/${td.id}.json`;

  if (existsSync(outPath)) {
    console.log(`  [skip] ${td.name} (cached)`);
    return;
  }

  const recentUrl = `${KS_BASE}/getDebates?key=${KS_KEY}&type=commons&person=${td.id}&num=50&page=1&output=js`;

  let result1: any;
  try {
    result1 = await ksGet(recentUrl);
  } catch (err) {
    await sleep(BASE_DELAY * 2);
    try {
      result1 = await ksGet(recentUrl);
    } catch {
      console.warn(`  [fail] ${td.name}: could not fetch recent`);
      writeFileSync(outPath, JSON.stringify({ id: td.id, name: td.name, recent: [], older: [], error: String(err) }));
      return;
    }
  }

  if (result1.status === 429) {
    await sleep(BASE_DELAY * 2);
    try {
      result1 = await ksGet(recentUrl);
    } catch {
      console.warn(`  [429] ${td.name}: skipping`);
      writeFileSync(outPath, JSON.stringify({ id: td.id, name: td.name, recent: [], older: [], error: "429" }));
      return;
    }
  }

  const recent = parseRows(result1.data?.rows);
  const totalResults: number = result1.data?.info?.total_results ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / 50));

  // Get older speeches from ~70% through their career
  const olderPage = Math.max(2, Math.min(totalPages - 1, Math.floor(totalPages * 0.7)));
  const olderUrl = `${KS_BASE}/getDebates?key=${KS_KEY}&type=commons&person=${td.id}&num=50&page=${olderPage}&output=js`;

  await sleep(BASE_DELAY);

  let older: Debate[] = [];
  try {
    const result2 = await ksGet(olderUrl);
    if (result2.status === 429) {
      await sleep(BASE_DELAY * 2);
      const retry = await ksGet(olderUrl);
      older = parseRows(retry.data?.rows);
    } else {
      older = parseRows(result2.data?.rows);
    }
  } catch {
    console.warn(`  [warn] ${td.name}: older fetch failed, using recent only`);
  }

  const out: RawFile = { id: td.id, name: td.name, recent, older };
  writeFileSync(outPath, JSON.stringify(out));
  console.log(`  [ok] ${td.name}: ${recent.length} recent + ${older.length} older (total ${totalResults})`);
}

class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private limit: number, private delayMs: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.limit) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    this.running++;
    try {
      const result = await fn();
      await sleep(this.delayMs);
      return result;
    } finally {
      this.running--;
      this.queue.shift()?.();
    }
  }
}

async function main() {
  mkdirSync("data/raw", { recursive: true });

  const roster: RosterEntry[] = JSON.parse(
    await Bun.file("data/roster.json").text()
  );
  console.log(`Fetching speeches for ${roster.length} TDs...`);

  const limiter = new ConcurrencyLimiter(CONCURRENCY, BASE_DELAY);

  await Promise.all(
    roster.map(td => limiter.run(() => fetchTD(td)))
  );

  console.log("\nDone.");
}

main().catch(err => { console.error(err); process.exit(1); });
