import { useState, useMemo } from 'react'
import { PARTIES } from '../data/parties'
import winsData from '../data/wins.json'
import './WinsPage.css'

interface Win {
  id: string
  title: string
  summary: string
  date: string
  category: string
  source_name: string
  source_url: string
}

const CATEGORY_LABELS: Record<string, string> = {
  housing: 'Housing',
  healthcare: 'Healthcare',
  climate: 'Climate',
  economy: 'Economy',
  agriculture: 'Agriculture',
  infrastructure: 'Infrastructure',
  publicServices: 'Public Services',
  education: 'Education',
  justice: 'Justice',
  borderIssues: 'Border / Unity',
  costOfLiving: 'Cost of Living',
  social: 'Social',
}

const CATEGORY_ICONS: Record<string, string> = {}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  }
  if (parts.length === 2) {
    const d = new Date(`${dateStr}-01`)
    return d.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })
  }
  return dateStr
}

export default function WinsPage() {
  const [filterParty, setFilterParty] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const partiesData = winsData.parties as Record<string, Win[]>

  const allWins = useMemo(() => {
    return PARTIES.flatMap(party => {
      const wins: Win[] = partiesData[party.id] ?? []
      return wins.map(w => ({ ...w, partyId: party.id, partyName: party.name, partyColor: party.color }))
    }).sort((a, b) => b.date.localeCompare(a.date))
  }, [partiesData])

  const categories = useMemo(() => {
    const cats = new Set(allWins.map(w => w.category))
    return Array.from(cats).sort()
  }, [allWins])

  const filtered = useMemo(() => {
    return allWins.filter(w => {
      if (filterParty !== 'all' && w.partyId !== filterParty) return false
      if (filterCategory !== 'all' && w.category !== filterCategory) return false
      return true
    })
  }, [allWins, filterParty, filterCategory])

  return (
    <div className="page-content wins-mode">
      <header>
        <h1>Recent Wins</h1>
        <p className="subtitle">Policy achievements and legislative victories by party</p>
        <p className="wins-date-note">Data as of {winsData.generated_at}</p>
      </header>

      <main className="wins-main">
        <div className="wins-controls">
          <div className="filter-group">
            <span className="control-label">Party</span>
            <div className="filter-pills">
              <button
                className={`pill ${filterParty === 'all' ? 'active' : ''}`}
                onClick={() => setFilterParty('all')}
              >
                All
              </button>
              {PARTIES.map(p => (
                <button
                  key={p.id}
                  className={`pill ${filterParty === p.id ? 'active' : ''}`}
                  style={filterParty === p.id ? { borderColor: p.color, color: p.color } : {}}
                  onClick={() => setFilterParty(p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="control-label">Topic</span>
            <div className="filter-pills">
              <button
                className={`pill ${filterCategory === 'all' ? 'active' : ''}`}
                onClick={() => setFilterCategory('all')}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`pill ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="wins-empty">No wins found for the selected filters.</div>
        ) : (
          <div className="wins-grid">
            {filtered.map(win => (
              <div
                key={win.id}
                className="win-card"
                style={{ borderTopColor: win.partyColor }}
              >
                <div className="win-card-header">
                  <span
                    className="win-party-badge"
                    style={{ borderColor: win.partyColor, color: win.partyColor }}
                  >
                    {win.partyName}
                  </span>
                  <span className="win-category-badge">
                    {CATEGORY_LABELS[win.category] ?? win.category}
                  </span>
                </div>
                <h3 className="win-title">{win.title}</h3>
                <p className="win-summary">{win.summary}</p>
                <div className="win-footer">
                  <span className="win-date">{formatDate(win.date)}</span>
                  {win.source_url ? (
                    <a
                      className="win-source"
                      href={win.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {win.source_name} →
                    </a>
                  ) : (
                    <span className="win-source-plain">{win.source_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
