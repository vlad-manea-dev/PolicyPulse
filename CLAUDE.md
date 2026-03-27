# PolicyPulse — Project State

Hackathon project: scores Irish TDs on political consistency by surfacing contradictions in their Dáil speeches. Full spec in PLAN.md.

## What's built

### Backend pipeline (`scripts/`)

Four bun scripts run in order:

```bash
export KILDARESTREET_API_KEY=...
export ANTHROPIC_API_KEY=...

bun run scripts/fetch-roster.ts    # → data/roster.json
bun run scripts/fetch-speeches.ts  # → data/raw/{id}.json
bun run scripts/score.ts           # → data/scores/{id}.json
bun run scripts/build-index.ts     # → data/all-scores.json + frontend/src/data/all-scores.json
```

All scripts skip already-cached files. Delete `data/raw/` or `data/scores/` to force a re-run.

**fetch-roster.ts** — Scrapes KildareStreet `/tds/`, calls `getMP` for each TD in target parties (FF, FG, SF, Labour, Social Democrats, Green), picks the 5 longest-serving per party by `entered_house` date. Writes 26 TDs to `data/roster.json`.

**fetch-speeches.ts** — For each TD, fetches 50 recent + 50 older Dáil speeches from KildareStreet (`type=commons`). Concurrent, 5 slots, 200ms delay. Caches to `data/raw/{ks-person-id}.json`.

**score.ts** — Calls Claude (`claude-haiku-4-5`) with contradiction detection prompt (see PLAN.md). Validates JSON shape, retries once with simplified prompt on malformed response. Writes to `data/scores/{id}.json`.

**build-index.ts** — Merges roster + scores into `data/all-scores.json` and copies to `frontend/src/data/all-scores.json`. Filters out error TDs, sorts each party's TDs by score ascending (most inconsistent first).

### Known issue with speech quality

The "older" speeches batch pulls from a single calculated page (~70% through total results), which lands on a single narrow week of debates. For many TDs the speeches at that depth are too short (< 30 words) and get filtered, leaving only recent speeches. This means Claude sees a narrow time window and finds mild intra-session inconsistencies rather than decade-spanning contradictions.

**Fix (not yet applied):** Fetch from multiple pages spread across the TD's career (e.g. pages at 20%, 40%, 60%, 80% of total) to give Claude diverse time coverage. Delete `data/raw/` and re-run `fetch-speeches.ts` and `score.ts` after applying the fix in `fetch-speeches.ts`.

### KildareStreet API

- Base: `https://www.kildarestreet.com/api/FUNCTION?key=KEY&...`
- Dáil debates: `getDebates?type=commons&person={ks-id}&num=50&page=N&output=js`
- TD history: `getMP?id={ks-id}&output=js` — returns array of memberships with `oir_personid`, `entered_house`, `left_house`
- bun's native `fetch()` is blocked by KildareStreet (ECONNRESET). All KS requests use `Bun.spawn(["curl", "-sL", ...])`.

### Frontend (`frontend/`)

React + TypeScript (Create React App). No router — view state managed in `App.tsx`.

**Views:**
- Home: party grid → click → Party view
- Party: logo, description, political compass, TD cards with photos
- Politician: TD profile with score bar, contradiction cards (quote A vs quote B, dates, severity dots, analysis)
- Leaderboard: all TDs sorted by contradiction score with filter/sort controls

**Data flow:** `frontend/src/data/parties.ts` imports `all-scores.json` and merges real TD data (name, constituency, photo, score, contradictions) with static party metadata (color, logo, description, compass position). `contradictionScore = 100 - consistency_score`.

**Run:**
```bash
cd frontend && npm start   # dev server at localhost:3000
```

## What still needs to be done

- **Speech quality fix** — fetch from multiple time-spread pages per TD (see above)
- **Say vs. Vote** — hit Oireachtas `/votes` for pre-selected bill IDs (Housing for All, Sláintecare, Climate Action Act 2021) and ask Claude to align statements vs. vote record. Store in `say_vs_vote` field of score file.
- **Party average scores** — show avg consistency score on party cards on the home screen
- **Polish** — responsive layout check, demo script prep (pre-identify 2 TDs with most dramatic contradictions)

## File structure

```
data/
  roster.json          # 26 TDs, 5 per party
  all-scores.json      # merged output for frontend
  raw/                 # cached speech data (gitignored)
  scores/              # cached Claude output (gitignored)
scripts/
  fetch-roster.ts
  fetch-speeches.ts
  score.ts
  build-index.ts
frontend/
  src/
    App.tsx            # view routing + party/home screens
    data/
      parties.ts       # merges all-scores.json with static party metadata
      all-scores.json  # copy of data/all-scores.json (kept in sync by build-index.ts)
    components/
      LeaderboardPage.tsx
      PoliticianPage.tsx   # TD detail screen
      PoliticalCompass.tsx
      PodiumAnimation.tsx
```
