import './IrelandMap.css'

// Party colors matching parties.ts
const PARTY_COLORS: Record<string, string> = {
  'sf':     '#287556',
  'ff':     '#4a773c',
  'fg':     '#1e528d',
  'labour': '#b02a2a',
  'sd':     '#5d326f',
  'green':  '#6b9e38',
}

const PARTY_NAMES: Record<string, string> = {
  'sf':     'Sinn Féin',
  'ff':     'Fianna Fáil',
  'fg':     'Fine Gael',
  'labour': 'Labour',
  'sd':     'Social Democrats',
  'green':  'Green Party',
}

// County centers (approximate, in a 200x280 viewBox) + dominant party from 2024 GE
const COUNTIES: { name: string; x: number; y: number; party: string }[] = [
  { name: 'Donegal',    x: 80,  y: 32,  party: 'sf' },
  { name: 'Sligo',      x: 58,  y: 68,  party: 'sf' },
  { name: 'Leitrim',    x: 78,  y: 72,  party: 'sf' },
  { name: 'Mayo',        x: 32,  y: 95,  party: 'fg' },
  { name: 'Roscommon',  x: 68,  y: 102, party: 'fg' },
  { name: 'Longford',   x: 95,  y: 105, party: 'ff' },
  { name: 'Cavan',      x: 110, y: 68,  party: 'sf' },
  { name: 'Monaghan',   x: 128, y: 58,  party: 'sf' },
  { name: 'Louth',      x: 152, y: 85,  party: 'sf' },
  { name: 'Meath',      x: 142, y: 110, party: 'fg' },
  { name: 'Westmeath',  x: 108, y: 118, party: 'ff' },
  { name: 'Galway',     x: 38,  y: 138, party: 'ff' },
  { name: 'Offaly',     x: 108, y: 142, party: 'ff' },
  { name: 'Laois',      x: 120, y: 160, party: 'ff' },
  { name: 'Dublin',     x: 164, y: 128, party: 'sf' },
  { name: 'Kildare',    x: 142, y: 148, party: 'sd' },
  { name: 'Wicklow',    x: 160, y: 168, party: 'fg' },
  { name: 'Clare',      x: 42,  y: 172, party: 'ff' },
  { name: 'Tipperary',  x: 88,  y: 190, party: 'ff' },
  { name: 'Kilkenny',   x: 118, y: 200, party: 'ff' },
  { name: 'Carlow',     x: 135, y: 192, party: 'ff' },
  { name: 'Wexford',    x: 150, y: 218, party: 'sf' },
  { name: 'Limerick',   x: 55,  y: 192, party: 'fg' },
  { name: 'Kerry',      x: 22,  y: 225, party: 'sf' },
  { name: 'Cork',       x: 62,  y: 248, party: 'ff' },
  { name: 'Waterford',  x: 112, y: 235, party: 'sf' },
]

// Simplified outline of the Republic of Ireland
const IRELAND_PATH = `
  M 164,125 C 167,115 170,102 168,90 C 166,78 162,68 155,60
  C 148,50 138,42 125,38 C 112,34 100,28 92,20
  C 86,14 78,12 72,18 C 66,24 58,30 52,40
  C 48,50 44,60 40,72 C 36,82 28,92 22,105
  C 18,115 15,125 18,135 C 22,140 28,142 32,148
  C 28,155 24,165 22,175 C 18,185 16,195 20,205
  C 24,215 18,225 15,238 C 14,248 18,258 28,265
  C 38,272 52,278 68,275 C 82,272 95,262 108,255
  C 118,250 130,242 142,232 C 152,222 158,210 164,195
  C 168,180 172,165 172,150 C 172,140 168,132 164,125 Z
`

// Legend entries (only parties that appear on the map)
const usedParties = COUNTIES.map(c => c.party).filter((p, i, a) => a.indexOf(p) === i)

export default function IrelandMap() {
  return (
    <div className="ireland-map-card">
      <h3 className="match-card-title">2024 Election Map</h3>
      <p className="map-subtitle">Dominant party by county</p>

      <svg viewBox="0 0 200 290" className="ireland-svg">
        {/* Ireland outline */}
        <path
          d={IRELAND_PATH}
          fill="#f5f2eb"
          stroke="#1a1a1a"
          strokeWidth="1.5"
        />

        {/* County dots */}
        {COUNTIES.map(county => (
          <g key={county.name} className="county-dot-group">
            <circle
              cx={county.x}
              cy={county.y}
              r={county.name === 'Dublin' ? 8 : 6}
              fill={PARTY_COLORS[county.party]}
              stroke="#fff"
              strokeWidth="1"
              opacity="0.9"
            />
            <title>{county.name}: {PARTY_NAMES[county.party]}</title>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="map-legend">
        {usedParties.map(p => (
          <div className="map-legend-item" key={p}>
            <span className="map-legend-dot" style={{ backgroundColor: PARTY_COLORS[p] }} />
            <span className="map-legend-label">{PARTY_NAMES[p]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
