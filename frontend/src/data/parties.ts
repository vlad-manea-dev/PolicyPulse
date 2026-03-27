import scoresData from './all-scores.json'

export interface Contradiction {
  topic: string
  quote_a: string
  quote_a_date: string
  quote_b: string
  quote_b_date: string
  severity: 1 | 2 | 3
  explanation: string
}

export interface Politician {
  name: string
  role?: string              // constituency
  title?: string             // e.g. Taoiseach, TD
  photo?: string
  tdId?: string
  contradictionScore?: number  // 0–100, higher = more contradictions
  contradictions?: Contradiction[]
}

export interface PartyIssueStances {
  housing: number        // 0–10: how strongly they address this issue
  costOfLiving: number
  healthcare: number
  agriculture: number
  climate: number
  infrastructure: number
  publicServices: number
  borderIssues: number
}

export interface Party {
  id: string
  name: string
  color: string
  logoText: string
  logoUrl?: string
  detailLogoUrl?: string     // transparent-bg version for the party detail page
  description: string
  compass: { economic: number; social: number }  // economic: -10 (left) to +10 (right), social: -10 (libertarian) to +10 (authoritarian)
  stances: PartyIssueStances
  people: Politician[]
}

// KildareStreet person ID → title
const TD_TITLES: Record<string, string> = {
  '172': 'Taoiseach',
  '358': 'Tánaiste',
  '298': 'Minister for Agriculture',
  '215': 'Minister of State',
  '490': 'Party Leader',
  '506': 'Party Leader',
  '343': 'Party Leader',
  '9':   'Party Leader',
  '102': 'Finance Spokesperson',
  '21':  'Former Ceann Comhairle',
  '5':   'Former Ceann Comhairle',
  '287': 'Former Party Leader',
}

// Maps slug from all-scores.json → party id used in PARTY_META
const SLUG_TO_ID: Record<string, string> = {
  ff:     'fianna-fail',
  fg:     'fine-gael',
  sf:     'sinn-fein',
  labour: 'labour',
  sd:     'social-democrats',
  green:  'green-party',
}

const PARTY_META: Omit<Party, 'people'>[] = [
  {
    id: 'fianna-fail',
    name: 'Fianna Fáil',
    color: '#4a773c',
    logoText: 'FF',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Fianna_F%C3%A1il_logo_%282024%29.svg/500px-Fianna_F%C3%A1il_logo_%282024%29.svg.png',
    description: "One of Ireland's two dominant centre-right parties, founded in 1926. Traditionally rooted in Irish republicanism, it has shifted to pragmatic centrism over decades in government, championing a mixed economy, rural Ireland, and EU membership.",
    compass: { economic: 2, social: 2 },
    stances: { housing: 5, costOfLiving: 5, healthcare: 6, agriculture: 8, climate: 4, infrastructure: 6, publicServices: 6, borderIssues: 5 },
  },
  {
    id: 'fine-gael',
    name: 'Fine Gael',
    color: '#1e528d',
    logoText: 'FG',
    logoUrl: '/assets/fg_logo.png',
    detailLogoUrl: '/assets/fg_logo_nobg.png',
    description: "Ireland's largest centre-right party, tracing its roots to the pro-Treaty side of the 1922 Civil War. Fine Gael champions free-market economics, fiscal responsibility, and strong EU ties. It is seen as the establishment party of business and the professional middle class.",
    compass: { economic: 4, social: 1 },
    stances: { housing: 5, costOfLiving: 5, healthcare: 6, agriculture: 6, climate: 5, infrastructure: 7, publicServices: 5, borderIssues: 4 },
  },
  {
    id: 'sinn-fein',
    name: 'Sinn Féin',
    color: '#287556',
    logoText: 'SF',
    logoUrl: '/assets/sf_logo.png',
    detailLogoUrl: '/assets/sf_logo_nobg.png',
    description: "A left-wing republican party with roots in the Irish independence movement. Sinn Féin advocates for Irish unity, public housing, higher corporate taxes, and a strong welfare state. Its surge in recent elections was driven by young, urban voters frustrated with housing and the cost of living.",
    compass: { economic: -5, social: -1 },
    stances: { housing: 10, costOfLiving: 9, healthcare: 8, agriculture: 5, climate: 6, infrastructure: 7, publicServices: 9, borderIssues: 9 },
  },
  {
    id: 'green-party',
    name: 'Green Party',
    color: '#6b9e38',
    logoText: 'GP',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Green_Party_%28Ireland%29_logo.svg/500px-Green_Party_%28Ireland%29_logo.svg.png',
    description: "Places environmental sustainability at the core of its platform, pushing for ambitious climate action and a just transition away from fossil fuels. The Green Party entered government in 2020 and delivered the landmark Climate Action Act. Its policies appeal to urban, educated voters concerned about the climate crisis.",
    compass: { economic: -2, social: -4 },
    stances: { housing: 6, costOfLiving: 6, healthcare: 6, agriculture: 5, climate: 10, infrastructure: 6, publicServices: 7, borderIssues: 3 },
  },
  {
    id: 'labour',
    name: 'Labour',
    color: '#b02a2a',
    logoText: 'LAB',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/The_logo_of_Labour_Party_in_Ireland_2021.svg/500px-The_logo_of_Labour_Party_in_Ireland_2021.svg.png',
    description: "Ireland's oldest party and the traditional voice of the organised working class and trade union movement. Labour advocates for workers' rights, public services, and progressive taxation. It is rebuilding under Ivana Bacik after a collapse in support following the 2011–2016 austerity coalition.",
    compass: { economic: -4, social: -2 },
    stances: { housing: 7, costOfLiving: 8, healthcare: 8, agriculture: 4, climate: 6, infrastructure: 6, publicServices: 9, borderIssues: 4 },
  },
  {
    id: 'social-democrats',
    name: 'Social Democrats',
    color: '#5d326f',
    logoText: 'SD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Social_Democrats_%28Ireland%29_logo.svg/500px-Social_Democrats_%28Ireland%29_logo.svg.png',
    description: "Founded in 2015, the Social Democrats push for a Nordic-style model in Ireland — prioritising public investment in housing, healthcare, and education. They strongly support Dáil reform, transparency, and evidence-based policy. A credible third-party voice for reform-minded, urban voters.",
    compass: { economic: -4, social: -5 },
    stances: { housing: 9, costOfLiving: 8, healthcare: 9, agriculture: 4, climate: 7, infrastructure: 7, publicServices: 10, borderIssues: 3 },
  },
]

const scoredByPartyId = new Map<string, typeof scoresData.parties[0]['tds']>()
for (const party of scoresData.parties) {
  const id = SLUG_TO_ID[party.slug]
  if (id) scoredByPartyId.set(id, party.tds)
}

export const PARTIES: Party[] = PARTY_META.map(meta => ({
  ...meta,
  people: (scoredByPartyId.get(meta.id) ?? []).map(td => ({
    name: td.name,
    role: td.constituency,
    title: TD_TITLES[td.id] ?? 'TD',
    photo: td.photo,
    tdId: td.id,
    // consistency_score (100=consistent) inverted to contradictionScore (100=most contradictions)
    contradictionScore: 100 - td.score,
    contradictions: td.contradictions as Contradiction[],
  })),
}))
