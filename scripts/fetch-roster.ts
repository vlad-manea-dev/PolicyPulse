#!/usr/bin/env bun
/**
 * Hits KildareStreet /tds/ to list current TDs, calls getMP for each
 * to get first_elected + oir_personid, then picks the 5 longest-serving
 * per target party and writes data/roster.json.
 */

import { writeFileSync, mkdirSync } from "fs";

const KS_KEY = process.env.KILDARESTREET_API_KEY;
if (!KS_KEY) throw new Error("Set KILDARESTREET_API_KEY env var");

const KS_BASE = "https://www.kildarestreet.com/api";

const TARGET_PARTIES: Record<string, { name: string; slug: string }> = {
  FF:  { name: "Fianna Fáil",      slug: "ff"     },
  FG:  { name: "Fine Gael",        slug: "fg"     },
  SF:  { name: "Sinn Féin",        slug: "sf"     },
  LAB: { name: "Labour",           slug: "labour" },
  SD:  { name: "Social Democrats", slug: "sd"     },
  GRN: { name: "Green Party",      slug: "green"  },
};

interface KSMembership {
  person_id: string;
  full_name: string;
  party: string;
  constituency: string;
  entered_house: string;
  left_house: string;
  oir_personid: string;
  image: string;
}

export interface RosterEntry {
  id: string;          // KildareStreet person_id
  oir_id: string;      // Oireachtas pId
  name: string;
  party: string;
  party_code: string;
  party_slug: string;
  constituency: string;
  first_elected: string;
  photo: string;
}

async function curl(url: string): Promise<string> {
  const proc = Bun.spawn(["curl", "-sL", url], { stdout: "pipe" });
  return new Response(proc.stdout).text();
}

async function scrapeTDs(): Promise<Array<{ person_id: string; party_code: string }>> {
  const html = await curl("https://www.kildarestreet.com/tds/");

  const result: Array<{ person_id: string; party_code: string }> = [];

  // Split by table rows; each TD has an image with their person ID
  for (const row of html.split("<tr>")) {
    const idMatch = row.match(/src="\/images\/mps\/(\d+)\.jpg/);
    if (!idMatch) continue;

    // Collect all <td> cell contents in this row
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m =>
      m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, "").trim()
    );

    // cells[0]=image (empty after stripping), cells[1]=name, cells[2]=party, cells[3]=constituency
    const party_code = cells[2] ?? "";
    if (party_code) result.push({ person_id: idMatch[1], party_code });
  }

  return result;
}

async function getMPHistory(personId: string): Promise<KSMembership[]> {
  const url = `${KS_BASE}/getMP?key=${KS_KEY}&id=${personId}&output=js`;
  const data = JSON.parse(await curl(url));
  if (Array.isArray(data)) return data as KSMembership[];
  if (data.error) throw new Error(`getMP error for ${personId}: ${data.error}`);
  return [];
}

function getFirstElected(history: KSMembership[]): string {
  return history.reduce(
    (min, m) => (m.entered_house < min ? m.entered_house : min),
    "9999-12-31"
  );
}

async function main() {
  mkdirSync("data", { recursive: true });

  console.log("Scraping KildareStreet /tds/...");
  const allTDs = await scrapeTDs();
  console.log(`Found ${allTDs.length} total TDs`);

  const targetTDs = allTDs.filter(td => td.party_code in TARGET_PARTIES);
  console.log(`${targetTDs.length} TDs in target parties, fetching histories...`);

  const roster: RosterEntry[] = [];
  const byParty: Record<string, RosterEntry[]> = {};

  for (const td of targetTDs) {
    let history: KSMembership[];
    try {
      history = await getMPHistory(td.person_id);
    } catch (err) {
      console.warn(`  Skipping ${td.person_id}: ${err}`);
      continue;
    }
    if (!history.length) continue;

    const current = history.find(m => m.left_house === "9999-12-31") ?? history[0];
    const firstElected = getFirstElected(history);

    const entry: RosterEntry = {
      id: td.person_id,
      oir_id: current.oir_personid ?? "",
      name: current.full_name,
      party: TARGET_PARTIES[td.party_code].name,
      party_code: td.party_code,
      party_slug: TARGET_PARTIES[td.party_code].slug,
      constituency: current.constituency,
      first_elected: firstElected,
      photo: `https://www.kildarestreet.com${current.image.replace("/mpsL/", "/mps/")}`,
    };

    byParty[td.party_code] ??= [];
    byParty[td.party_code].push(entry);
    process.stdout.write(".");
  }
  console.log();

  // Sort each party by first_elected (ascending = longest-serving first), take top 5
  for (const [code, tds] of Object.entries(byParty)) {
    const top5 = tds
      .sort((a, b) => a.first_elected.localeCompare(b.first_elected))
      .slice(0, 5);
    console.log(`${code}: ${top5.map(t => `${t.name} (${t.first_elected})`).join(", ")}`);
    roster.push(...top5);
  }

  writeFileSync("data/roster.json", JSON.stringify(roster, null, 2));
  console.log(`\nWrote ${roster.length} TDs to data/roster.json`);
}

main().catch(err => { console.error(err); process.exit(1); });
