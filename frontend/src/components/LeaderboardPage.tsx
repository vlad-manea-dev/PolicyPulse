import { useState, useMemo } from 'react'
import { PARTIES } from '../data/parties'
import './LeaderboardPage.css'

interface LeaderboardEntry {
  name: string
  role: string
  score: number
  partyId: string
  partyName: string
  partyColor: string
}

const SCORE_LABEL = (truthScore: number): string => {
  if (truthScore >= 80) return 'Excellent'
  if (truthScore >= 60) return 'Good'
  if (truthScore >= 40) return 'Mixed'
  if (truthScore >= 20) return 'Poor'
  return 'Very Poor'
}

const SCORE_COLOR = (truthScore: number): string => {
  if (truthScore >= 80) return '#287556'
  if (truthScore >= 60) return '#4a773c'
  if (truthScore >= 40) return '#b08a00'
  if (truthScore >= 20) return '#c0622a'
  return '#b02a2a'
}

export default function LeaderboardPage() {
  const [filterParty, setFilterParty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const allEntries: LeaderboardEntry[] = useMemo(() => {
    return PARTIES.flatMap(party =>
      party.people.map(p => ({
        name: p.name,
        role: p.role ?? '',
        score: 100 - (p.contradictionScore ?? 0),
        partyId: party.id,
        partyName: party.name,
        partyColor: party.color,
      }))
    )
  }, [])

  const filtered = useMemo(() => {
    const list = filterParty === 'all'
      ? allEntries
      : allEntries.filter(e => e.partyId === filterParty)

    return [...list].sort((a, b) =>
      sortBy === 'score' ? b.score - a.score : a.name.localeCompare(b.name)
    )
  }, [allEntries, filterParty, sortBy])

  const bestScore = filtered[0]?.score ?? 100

  return (
    <div className="page-content leaderboard-mode">
      <header>
        <h1>Truth Leaderboard</h1>
        <p className="subtitle">Ranked by how well their Dáil record matches their public promises</p>
      </header>

      <main className="leaderboard-main">
        {/* Controls */}
        <div className="leaderboard-controls">
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
            <span className="control-label">Sort by</span>
            <div className="filter-pills">
              <button className={`pill ${sortBy === 'score' ? 'active' : ''}`} onClick={() => setSortBy('score')}>Score</button>
              <button className={`pill ${sortBy === 'name' ? 'active' : ''}`} onClick={() => setSortBy('name')}>Name</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="leaderboard-table">
          <div className="table-header">
            <span className="col-rank">#</span>
            <span className="col-name">Politician</span>
            <span className="col-party">Party</span>
            <span className="col-score">Truth Score</span>
          </div>

          {filtered.map((entry, idx) => {
            const isTop3 = sortBy === 'score' && idx < 3 && filterParty === 'all'
            const medals = ['🥇', '🥈', '🥉']
            return (
              <div
                key={entry.name}
                className={`table-row ${isTop3 ? `top-${idx + 1}` : ''} ${hoveredRow === idx ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <span className="col-rank">
                  {isTop3 ? medals[idx] : <span className="rank-num">{idx + 1}</span>}
                </span>
                <span className="col-name">
                  <span className="politician-name">{entry.name}</span>
                  <span className="politician-role">{entry.role}</span>
                </span>
                <span className="col-party">
                  <span className="party-badge" style={{ borderColor: entry.partyColor, color: entry.partyColor }}>
                    {entry.partyName}
                  </span>
                </span>
                <span className="col-score">
                  <div className="score-bar-wrap">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${(entry.score / bestScore) * 100}%`,
                        backgroundColor: SCORE_COLOR(entry.score),
                      }}
                    />
                  </div>
                  <span className="score-number" style={{ color: SCORE_COLOR(entry.score) }}>
                    {entry.score}
                  </span>
                  <span className="score-label" style={{ color: SCORE_COLOR(entry.score) }}>
                    {SCORE_LABEL(entry.score)}
                  </span>
                </span>
              </div>
            )
          })}
        </div>

        <p className="scope-note">Truth scores are based on cross-referencing public statements with official Dáil voting records.</p>
      </main>
    </div>
  )
}
