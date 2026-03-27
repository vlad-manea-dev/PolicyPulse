/**
 * fetch-wins.ts
 * Uses Claude's built-in web_search tool to find recent Irish party policy wins,
 * then extracts them as structured JSON. No separate search API key needed.
 *
 * Usage:
 *   export ANTHROPIC_API_KEY=...
 *   bun run scripts/fetch-wins.ts
 *
 * Output: data/wins.json  +  frontend/src/data/wins.json
 */

import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync, mkdirSync } from 'fs'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set.')
  process.exit(1)
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

interface Win {
  id: string
  title: string
  summary: string
  date: string
  category: string
  source_name: string
  source_url: string
}

const PARTIES: { id: string; name: string; slug: string; searchTerms: string[] }[] = [
  {
    id: 'fianna-fail',
    name: 'Fianna Fáil',
    slug: 'ff',
    searchTerms: [
      'Fianna Fail Ireland policy achievement 2025',
      'Fianna Fail Dáil legislation passed 2025',
    ],
  },
  {
    id: 'fine-gael',
    name: 'Fine Gael',
    slug: 'fg',
    searchTerms: [
      'Fine Gael Ireland policy win 2025',
      'Fine Gael legislation achievement 2025',
    ],
  },
  {
    id: 'sinn-fein',
    name: 'Sinn Féin',
    slug: 'sf',
    searchTerms: [
      'Sinn Fein Ireland policy campaign win 2025',
      'Sinn Fein Dáil amendment passed 2025',
    ],
  },
  {
    id: 'green-party',
    name: 'Green Party',
    slug: 'green',
    searchTerms: [
      'Green Party Ireland climate policy win 2025',
      'Green Party Ireland legislation achievement 2025',
    ],
  },
  {
    id: 'labour',
    name: 'Labour',
    slug: 'labour',
    searchTerms: [
      'Labour Party Ireland policy achievement 2025',
      'Labour Ireland workers rights legislation 2025',
    ],
  },
  {
    id: 'social-democrats',
    name: 'Social Democrats',
    slug: 'sd',
    searchTerms: [
      'Social Democrats Ireland policy win 2025',
      'Social Democrats Ireland legislation achieved 2025',
    ],
  },
]

async function fetchWinsForParty(party: typeof PARTIES[0]): Promise<Win[]> {
  console.log(`  Searching for ${party.name}...`)

  const prompt = `You are a political researcher. Find 4 concrete policy wins for ${party.name} in Ireland between January 2024 and March 2026.

Search multiple times using different focused queries, for example:
- "${party.name} Ireland legislation passed 2024"
- "${party.name} Ireland policy achievement 2025"
- "${party.name} Ireland bill enacted 2024 2025"
- "${party.name} Ireland Dáil vote won"

A valid "win" must be:
- A bill passed into law, policy enacted, or measurable outcome delivered
- Something ${party.name} can credibly claim credit for
- Dated between January 2024 and March 2026
- NOT a promise, plan, or proposal — it must have actually happened

After searching, respond with ONLY a JSON array (no other text):
[
  {
    "title": "Short headline (max 8 words)",
    "summary": "2-3 sentence summary of what was achieved and why it matters to Irish people",
    "date": "YYYY-MM-DD (exact date from article, or YYYY-MM if day unknown)",
    "category": "one of: housing, healthcare, climate, economy, agriculture, infrastructure, publicServices, education, justice, borderIssues, costOfLiving",
    "source_name": "Publication name",
    "source_url": "Full URL of the source article"
  }
]

If you cannot find 4 genuine wins, return fewer. Return ONLY the JSON array.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    tools: [{ type: 'web_search_20250305', name: 'web_search' } as any],
    tool_choice: { type: 'auto' },
    messages: [{ role: 'user', content: prompt }],
  })

  // extract the final text block (after tool use)
  const textBlock = message.content.findLast(b => b.type === 'text')
  const text = textBlock?.type === 'text' ? textBlock.text : ''

  try {
    const cleaned = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
    const wins = JSON.parse(cleaned) as Win[]
    return wins.map((w, i) => ({ ...w, id: `${party.id}-${Date.now()}-${i}` }))
  } catch {
    console.warn(`  Failed to parse Claude response for ${party.name}`)
    console.warn(`  Response was: ${text.slice(0, 200)}`)
    return []
  }
}

async function main() {
  console.log('Fetching party wins via Claude web search...\n')

  const result: Record<string, Win[]> = {}

  for (const party of PARTIES) {
    console.log(`[${party.name}]`)
    try {
      result[party.id] = await fetchWinsForParty(party)
      console.log(`  Extracted ${result[party.id].length} wins\n`)
    } catch (err) {
      console.error(`  Error: ${err}`)
      result[party.id] = []
    }
    // rate limit between parties
    await new Promise(r => setTimeout(r, 500))
  }

  const output = {
    generated_at: new Date().toISOString().split('T')[0],
    parties: result,
  }

  mkdirSync('data', { recursive: true })
  writeFileSync('data/wins.json', JSON.stringify(output, null, 2))
  writeFileSync('frontend/src/data/wins.json', JSON.stringify(output, null, 2))

  console.log('Written to data/wins.json and frontend/src/data/wins.json')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
