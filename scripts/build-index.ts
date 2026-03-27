#!/usr/bin/env bun
/**
 * Merges data/roster.json + data/scores/ into data/all-scores.json.
 *
 * Output shape:
 * { parties: [{ name, slug, tds: [{ id, name, score, contradictions, say_vs_vote }] }] }
 */

import { writeFileSync, existsSync } from "fs";
import type { RosterEntry } from "./fetch-roster";

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
  say_vs_vote?: any;
  error?: boolean;
}

interface TdOutput {
  id: string;
  name: string;
  constituency: string;
  photo: string;
  score: number | null;
  contradictions: Contradiction[];
  say_vs_vote: any;
}

interface PartyOutput {
  name: string;
  slug: string;
  tds: TdOutput[];
}

interface AllScores {
  parties: PartyOutput[];
  generated_at: string;
}

async function main() {
  const roster: RosterEntry[] = JSON.parse(await Bun.file("data/roster.json").text());

  // Group roster by party, preserving order of parties as encountered
  const partyMap = new Map<string, { name: string; slug: string; tds: RosterEntry[] }>();
  for (const td of roster) {
    if (!partyMap.has(td.party_code)) {
      partyMap.set(td.party_code, { name: td.party, slug: td.party_slug, tds: [] });
    }
    partyMap.get(td.party_code)!.tds.push(td);
  }

  const parties: PartyOutput[] = [];
  let totalTDs = 0;
  let scoredTDs = 0;

  for (const [, party] of partyMap) {
    const tds: TdOutput[] = [];

    for (const td of party.tds) {
      const scorePath = `data/scores/${td.id}.json`;
      let score: ScoreFile | null = null;

      if (existsSync(scorePath)) {
        try {
          score = JSON.parse(await Bun.file(scorePath).text());
        } catch {
          console.warn(`  Could not parse ${scorePath}`);
        }
      } else {
        console.warn(`  Missing score for ${td.name} (${td.id})`);
      }

      totalTDs++;
      if (score && !score.error && score.consistency_score !== null) scoredTDs++;

      // Filter out TDs with no score so the UI doesn't show empty cards
      if (!score || score.error || score.consistency_score === null) continue;

      tds.push({
        id: td.id,
        name: td.name,
        constituency: td.constituency,
        photo: td.photo,
        score: score.consistency_score,
        contradictions: score.contradictions ?? [],
        say_vs_vote: score.say_vs_vote ?? null,
      });
    }

    if (tds.length > 0) {
      // Sort by score ascending (most inconsistent first — more interesting)
      tds.sort((a, b) => (a.score ?? 100) - (b.score ?? 100));
      parties.push({ name: party.name, slug: party.slug, tds });
    }
  }

  const out: AllScores = {
    parties,
    generated_at: new Date().toISOString(),
  };

  writeFileSync("data/all-scores.json", JSON.stringify(out, null, 2));
  console.log(`Wrote data/all-scores.json`);
  console.log(`${scoredTDs}/${totalTDs} TDs have scores`);
  for (const p of parties) {
    const avg = p.tds.length
      ? Math.round(p.tds.reduce((s, t) => s + (t.score ?? 0), 0) / p.tds.length)
      : null;
    console.log(`  ${p.name}: ${p.tds.length} TDs, avg score ${avg}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
