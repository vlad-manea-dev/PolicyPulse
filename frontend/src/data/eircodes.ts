// Eircode routing key → region profile
// Routing keys: Dublin = D01–D24, rest = letter prefix

export interface RegionProfile {
  name: string
  type: 'dublin_inner' | 'dublin_suburbs' | 'city' | 'commuter' | 'rural' | 'border'
  issues: IssueWeights
}

export interface IssueWeights {
  housing: number        // 0–10
  costOfLiving: number
  healthcare: number
  agriculture: number
  climate: number
  infrastructure: number
  publicServices: number
  borderIssues: number
}

// Dublin inner city D01–D08
const dublinInner: RegionProfile = {
  name: 'Dublin City Centre',
  type: 'dublin_inner',
  issues: { housing: 10, costOfLiving: 9, healthcare: 7, agriculture: 0, climate: 6, infrastructure: 5, publicServices: 7, borderIssues: 1 },
}

// Dublin suburbs D09–D18
const dublinNorthSouth: RegionProfile = {
  name: 'Dublin Suburbs',
  type: 'dublin_suburbs',
  issues: { housing: 9, costOfLiving: 8, healthcare: 6, agriculture: 1, climate: 6, infrastructure: 7, publicServices: 7, borderIssues: 1 },
}

// Dublin west D20–D24
const dublinWest: RegionProfile = {
  name: 'Dublin West',
  type: 'dublin_suburbs',
  issues: { housing: 9, costOfLiving: 9, healthcare: 7, agriculture: 1, climate: 5, infrastructure: 8, publicServices: 8, borderIssues: 1 },
}

// Fingal / North Dublin commuter belt
const fingal: RegionProfile = {
  name: 'Fingal & North Dublin',
  type: 'commuter',
  issues: { housing: 9, costOfLiving: 8, healthcare: 6, agriculture: 3, climate: 5, infrastructure: 9, publicServices: 7, borderIssues: 1 },
}

// Kildare / Wicklow / Meath commuter belt
const commuter: RegionProfile = {
  name: 'Commuter Belt',
  type: 'commuter',
  issues: { housing: 8, costOfLiving: 8, healthcare: 6, agriculture: 4, climate: 5, infrastructure: 9, publicServices: 6, borderIssues: 1 },
}

// Cork city
const corkCity: RegionProfile = {
  name: 'Cork City',
  type: 'city',
  issues: { housing: 8, costOfLiving: 7, healthcare: 7, agriculture: 2, climate: 6, infrastructure: 7, publicServices: 7, borderIssues: 1 },
}

// Cork county / Kerry / West
const southwest: RegionProfile = {
  name: 'Southwest (Cork/Kerry)',
  type: 'rural',
  issues: { housing: 4, costOfLiving: 6, healthcare: 8, agriculture: 8, climate: 7, infrastructure: 6, publicServices: 6, borderIssues: 1 },
}

// Galway / Connacht
const west: RegionProfile = {
  name: 'West (Galway/Connacht)',
  type: 'rural',
  issues: { housing: 5, costOfLiving: 6, healthcare: 8, agriculture: 8, climate: 7, infrastructure: 7, publicServices: 7, borderIssues: 2 },
}

// Midlands
const midlands: RegionProfile = {
  name: 'Midlands',
  type: 'rural',
  issues: { housing: 4, costOfLiving: 6, healthcare: 7, agriculture: 8, climate: 6, infrastructure: 7, publicServices: 7, borderIssues: 2 },
}

// Border counties (Cavan, Monaghan, Donegal)
const border: RegionProfile = {
  name: 'Border Region',
  type: 'border',
  issues: { housing: 3, costOfLiving: 6, healthcare: 8, agriculture: 9, climate: 5, infrastructure: 8, publicServices: 7, borderIssues: 9 },
}

// Southeast (Wexford, Waterford, Kilkenny)
const southeast: RegionProfile = {
  name: 'Southeast',
  type: 'rural',
  issues: { housing: 4, costOfLiving: 6, healthcare: 7, agriculture: 7, climate: 5, infrastructure: 7, publicServices: 7, borderIssues: 1 },
}

// Limerick / Clare / Tipperary
const midwest: RegionProfile = {
  name: 'Midwest (Limerick/Clare)',
  type: 'city',
  issues: { housing: 6, costOfLiving: 6, healthcare: 7, agriculture: 6, climate: 5, infrastructure: 7, publicServices: 7, borderIssues: 1 },
}

// Routing key first letter → region (D handled separately)
const LETTER_MAP: Record<string, RegionProfile> = {
  A: commuter,      // Wicklow, South Kildare, South Meath
  C: corkCity,      // Cork City
  E: midwest,       // Clare, Limerick City, North Tipperary
  F: west,          // Galway, Roscommon, Leitrim
  H: border,        // Cavan, Donegal, Monaghan
  K: fingal,        // Fingal, North Meath
  N: midlands,      // Kildare, Longford, Offaly, Westmeath
  P: southwest,     // Cork County, Kerry
  R: southeast,     // Kilkenny, South Tipperary, Waterford, Wexford
  T: midwest,       // Limerick County, North Tipperary
  V: southwest,     // Kerry, West Cork
  W: southeast,     // Waterford City & County
  X: southeast,     // Carlow, South Kilkenny, Wexford
  Y: southeast,     // Wexford, South Wicklow
}

export function getRegionFromEircode(eircode: string): RegionProfile | null {
  const cleaned = eircode.replace(/\s/g, '').toUpperCase()
  if (cleaned.length < 3) return null

  // Dublin
  if (cleaned[0] === 'D') {
    const num = parseInt(cleaned.slice(1, 3), 10)
    if (isNaN(num)) return null
    if (num >= 1 && num <= 8) return dublinInner
    if (num >= 20 && num <= 24) return dublinWest
    if (num >= 9 && num <= 18) return dublinNorthSouth
    return dublinInner // fallback for D24 etc
  }

  return LETTER_MAP[cleaned[0]] ?? null
}
