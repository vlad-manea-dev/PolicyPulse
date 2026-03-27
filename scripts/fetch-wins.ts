/**
 * fetch-wins.ts
 * Fetches recent political news for each Irish party using Google Custom Search API,
 * then uses Claude to extract structured "wins" (policy achievements).
 *
 * Setup:
 *   1. Google API key: console.cloud.google.com → enable "Custom Search API"
 *   2. Search engine ID (cx): programmablesearchengine.google.com → create engine,
 *      set to search the whole web, copy the ID
 *
 * Usage:
 *   export GOOGLE_API_KEY=...
 *   export GOOGLE_CX=...
 *   export ANTHROPIC_API_KEY=...
 *   bun run scripts/fetch-wins.ts
 *
 * Output: data/wins.json  +  frontend/src/data/wins.json
 * Note: free tier is 100 queries/day (this script uses ~12 queries total)
 */

import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync, mkdirSync } from 'fs'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CX = process.env.GOOGLE_CX
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!GOOGLE_API_KEY) {
  console.error('GOOGLE_API_KEY not set.')
  console.error('  1. Go to console.cloud.google.com and enable the "Custom Search API"')
  console.error('  2. Create an API key under APIs & Services → Credentials')
  process.exit(1)
}
if (!GOOGLE_CX) {
  console.error('GOOGLE_CX not set.')
  console.error('  Go to programmablesearchengine.google.com, create a search engine')
  console.error('  set it to search the whole web, and copy the Search Engine ID')
  process.exit(1)
}
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

async function braveSearch(query: string): Promise<{ title: string; description: string; url: string; age?: string }[]> {
  const params = new URLSearchParams({
    q: query,
    count: '10',
    freshness: 'py', // past year
    search_lang: 'en',
    country: 'IE',
    text_decorations: '0',
  })

  const res = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': BRAVE_API_KEY!,
    },
  })

  if (!res.ok) {
    throw new Error(`Brave Search failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json() as any
  return (data.web?.results ?? []).map((r: any) => ({
    title: r.title ?? '',
    description: r.description ?? '',
    url: r.url ?? '',
    age: r.age ?? '',
  }))
}

async function extractWinsWithClaude(
  partyName: string,
  articles: { title: string; description: string; url: string; age?: string }[]
): Promise<Win[]> {
  const articleText = articles.map((a, i) =>
    `[${i + 1}] ${a.title}\n${a.description}\nURL: ${a.url}${a.age ? `\nDate: ${a.age}` : ''}`
  ).join('\n\n')

  const prompt = `You are analyzing Irish political news to extract concrete policy wins for ${partyName}.

Here are recent news articles:
${articleText}

Extract up to 4 genuine policy achievements or wins for ${partyName} from these articles. A "win" is:
- A bill passed, policy enacted, or measurable outcome achieved
- Something the party can credibly claim credit for
- Real and verifiable (not just a promise or plan)

For each win, respond with a JSON array like this:
[
  {
    "title": "Short headline (max 8 words)",
    "summary": "2-3 sentence summary of what was achieved and why it matters",
    "date": "YYYY-MM-DD (best estimate from article, or YYYY-MM if day unknown)",
    "category": "one of: housing, healthcare, climate, economy, agriculture, infrastructure, publicServices, education, justice, borderIssues, costOfLiving",
    "source_name": "Publication name",
    "source_url": "The article URL"
  }
]

Return ONLY the JSON array. If there are no genuine wins, return [].`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const cleaned = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
    const wins = JSON.parse(cleaned) as Win[]
    return wins.map((w, i) => ({ ...w, id: `${partyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}` }))
  } catch {
    console.warn(`  Failed to parse Claude response for ${partyName}`)
    return []
  }
}

async function fetchWinsForParty(party: typeof PARTIES[0]): Promise<Win[]> {
  console.log(`  Searching for ${party.name}...`)
  const allArticles: typeof [] = []

  for (const query of party.searchTerms) {
    try {
      const results = await braveSearch(query)
      allArticles.push(...results)
      await new Promise(r => setTimeout(r, 300))
    } catch (err) {
      console.warn(`  Search failed for "${query}": ${err}`)
    }
  }

  // deduplicate by URL
  const seen = new Set<string>()
  const unique = allArticles.filter(a => {
    if (seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })

  console.log(`  Found ${unique.length} articles, extracting wins...`)
  return extractWinsWithClaude(party.name, unique.slice(0, 15))
}

async function main() {
  console.log('Fetching party wins via Brave Search + Claude...\n')

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
