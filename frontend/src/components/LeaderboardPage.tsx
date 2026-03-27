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

const SCORE_LABEL = (score: number): string => {
  if (score >= 80) return 'Chronic'
  if (score >= 60) return 'Frequent'
  if (score >= 40) return 'Moderate'
  if (score >= 20) return 'Rare'
  return 'Clean'
}

const SCORE_COLOR = (score: number): string => {
  if (score >= 80) return '#b02a2a'
  if (score >= 60) return '#c0622a'
  if (score >= 40) return '#b08a00'
  if (score >= 20) return '#4a773c'
  return '#287556'
}

export default function LeaderboardPage({ onBack }: { onBack: () => void }) {
  const [filterParty, setFilterParty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const allEntries: LeaderboardEntry[] = useMemo(() => {
    return PARTIES.flatMap(party =>
      party.people.map(p => ({
        name: p.name,
        role: p.role ?? '',
        score: p.contradictionScore ?? 0,
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

  const topScore = filtered[0]?.score ?? 100

  return (
    <div className="app leaderboard-mode">
      <header>
        <button className="back-btn" onClick={onBack}>← Back to Parties</button>
        <h1>Contradiction Leaderboard</h1>
        <p className="subtitle">Ranked by how often their Dáil record contradicts their public promises</p>
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
            <span className="col-score">Contradiction Score</span>
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
                        width: `${(entry.score / topScore) * 100}%`,
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

        <p className="scope-note">Scores are indicative and based on cross-referencing public statements with official Dáil voting records.</p>
      </main>
    </div>
  )
}
