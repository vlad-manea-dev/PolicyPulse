#!/usr/bin/env bun
/**
 * For each TD in data/raw/, calls Claude (claude-haiku-4-5) with the
 * contradiction detection prompt and writes results to data/scores/{id}.json.
 *
 * Validates JSON shape; retries once with simplified prompt if malformed.
 */

import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Set ANTHROPIC_API_KEY env var (export ANTHROPIC_API_KEY=sk-ant-...)");
}
const client = new Anthropic();

const MODEL = "claude-haiku-4-5";
const MAX_STATEMENTS = 80; // cap to stay well within context

interface Debate {
  date: string;
  body: string;
}

interface RawFile {
  id: string;
  name: string;
  recent: Debate[];
  older: Debate[];
  error?: string;
}

interface Contradiction {
  topic: string;
  quote_a: string;
  quote_a_date: string;
  quote_b: string;
  quote_b_date: string;
  severity: 1 | 2 | 3;
  explanation: string;
}

interface ScoreFile {
  td_id: string;
  name: string;
  consistency_score: number | null;
  contradictions: Contradiction[];
  error?: boolean;
}

function buildPrompt(tdName: string, statements: string): string {
  return `You are analyzing speeches made by ${tdName}, an Irish politician, in the Dáil.

Below are statements they made at different times. Find the top 3 most significant contradictions — where they clearly stated opposite or incompatible positions on the same topic at different points in time.

For each contradiction return:
{
  "topic": "one-word topic label",
  "quote_a": "exact quote",
  "quote_a_date": "YYYY-MM-DD",
  "quote_b": "exact quote",
  "quote_b_date": "YYYY-MM-DD",
  "severity": 1-3,
  "explanation": "one sentence explaining the contradiction"
}

Also return a top-level consistency_score from 0 to 100, where 100 means perfectly consistent (no contradictions found) and 0 means a politician who has directly contradicted themselves on major issues repeatedly. Factor in the severity and number of contradictions you found.

Return a single JSON object in this shape:
{
  "consistency_score": 0-100,
  "contradictions": [
    { "topic": ..., "quote_a": ..., "quote_a_date": ...,
      "quote_b": ..., "quote_b_date": ..., "severity": 1-3,
      "explanation": ... }
  ]
}

Only return the JSON.

STATEMENTS:
${statements}`;
}

function buildSimplifiedPrompt(tdName: string, statements: string): string {
  return `You are analyzing speeches by ${tdName}, an Irish politician.

Find at least 1 contradiction where they stated opposite positions at different times.

Return JSON only:
{
  "consistency_score": 0-100,
  "contradictions": [
    { "topic": "string", "quote_a": "string", "quote_a_date": "YYYY-MM-DD",
      "quote_b": "string", "quote_b_date": "YYYY-MM-DD", "severity": 1,
      "explanation": "string" }
  ]
}

STATEMENTS:
${statements}`;
}

function isValidScore(parsed: any): parsed is { consistency_score: number; contradictions: Contradiction[] } {
  return (
    typeof parsed?.consistency_score === "number" &&
    Array.isArray(parsed?.contradictions) &&
    parsed.contradictions.length >= 1 &&
    parsed.contradictions.every(
      (c: any) =>
        typeof c.topic === "string" &&
        typeof c.quote_a === "string" &&
        typeof c.quote_b === "string" &&
        typeof c.explanation === "string"
    )
  );
}

async function callClaude(prompt: string): Promise<{ consistency_score: number; contradictions: Contradiction[] } | null> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";

  // Extract JSON from response (strip markdown fences if present)
  const jsonText = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();

  try {
    const parsed = JSON.parse(jsonText);
    return isValidScore(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function prepareStatements(raw: RawFile): string {
  const all = [...raw.recent, ...raw.older]
    .filter(d => d.body && d.body.split(/\s+/).length >= 30);

  // Deduplicate by body prefix
  const seen = new Set<string>();
  const unique = all.filter(d => {
    const key = d.body.slice(0, 100);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Shuffle to mix recent and older, then cap
  unique.sort(() => Math.random() - 0.5);
  const capped = unique.slice(0, MAX_STATEMENTS);

  // Sort by date for prompt readability
  capped.sort((a, b) => a.date.localeCompare(b.date));

  return capped
    .map(d => `[${d.date}] ${d.body}`)
    .join("\n\n");
}

async function scoreTD(rawFile: RawFile): Promise<ScoreFile> {
  const base: ScoreFile = {
    td_id: rawFile.id,
    name: rawFile.name,
    consistency_score: null,
    contradictions: [],
    error: true,
  };

  if (rawFile.error || (rawFile.recent.length === 0 && rawFile.older.length === 0)) {
    console.warn(`  [skip] ${rawFile.name}: no speeches`);
    return base;
  }

  const statements = prepareStatements(rawFile);
  if (!statements) {
    console.warn(`  [skip] ${rawFile.name}: no usable statements`);
    return base;
  }

  // Primary attempt
  let result = await callClaude(buildPrompt(rawFile.name, statements));

  if (!result) {
    console.warn(`  [retry] ${rawFile.name}: malformed response, retrying with simplified prompt`);
    result = await callClaude(buildSimplifiedPrompt(rawFile.name, statements));
  }

  if (!result) {
    console.warn(`  [fail] ${rawFile.name}: both attempts failed`);
    return base;
  }

  return {
    td_id: rawFile.id,
    name: rawFile.name,
    consistency_score: result.consistency_score,
    contradictions: result.contradictions.slice(0, 3),
  };
}

async function main() {
  mkdirSync("data/scores", { recursive: true });

  const rawFiles = readdirSync("data/raw").filter(f => f.endsWith(".json"));
  if (rawFiles.length === 0) {
    console.error("No files in data/raw/ — run fetch-speeches.ts first");
    process.exit(1);
  }

  console.log(`Scoring ${rawFiles.length} TDs with ${MODEL}...`);

  let succeeded = 0;
  let failed = 0;

  for (const file of rawFiles) {
    const tdId = file.replace(".json", "");
    const outPath = `data/scores/${tdId}.json`;

    if (existsSync(outPath)) {
      console.log(`  [skip] ${tdId} (cached)`);
      succeeded++;
      continue;
    }

    const raw: RawFile = JSON.parse(await Bun.file(`data/raw/${file}`).text());

    try {
      const score = await scoreTD(raw);
      writeFileSync(outPath, JSON.stringify(score, null, 2));
      if (!score.error) {
        console.log(`  [ok] ${raw.name}: score=${score.consistency_score}, contradictions=${score.contradictions.length}`);
        succeeded++;
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`  [error] ${raw.name}: ${err}`);
      writeFileSync(outPath, JSON.stringify({ ...raw, error: true, consistency_score: null, contradictions: [] }));
      failed++;
    }
  }

  console.log(`\nScored ${succeeded}/${rawFiles.length} TDs successfully (${failed} failed)`);
}

main().catch(err => { console.error(err); process.exit(1); });
