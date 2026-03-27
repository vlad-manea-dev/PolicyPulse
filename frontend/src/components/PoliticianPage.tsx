import { Politician, Party, Contradiction } from '../data/parties'
import './PoliticianPage.css'

// followThrough = 100 - contradictionScore, higher is better
const SCORE_LABEL = (ft: number): string => {
  if (ft >= 80) return 'Excellent'
  if (ft >= 60) return 'Good'
  if (ft >= 40) return 'Mixed'
  if (ft >= 20) return 'Poor'
  return 'Very Poor'
}

const SCORE_COLOR = (ft: number): string => {
  if (ft >= 80) return '#287556'
  if (ft >= 60) return '#4a773c'
  if (ft >= 40) return '#b08a00'
  if (ft >= 20) return '#c0622a'
  return '#b02a2a'
}

const GRADE = (ft: number): string => {
  if (ft >= 90) return 'A+'
  if (ft >= 80) return 'A'
  if (ft >= 70) return 'B+'
  if (ft >= 60) return 'B'
  if (ft >= 50) return 'C+'
  if (ft >= 40) return 'C'
  if (ft >= 25) return 'D'
  return 'F'
}

const ordinal = (n: number): string => {
  const s = ['th','st','nd','rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

const SEVERITY_COLOR = (severity: 1 | 2 | 3): string => {
  if (severity === 3) return '#b02a2a'
  if (severity === 2) return '#c0622a'
  return '#b08a00'
}

const SEVERITY_LABEL = (severity: 1 | 2 | 3): string => {
  if (severity === 3) return 'High'
  if (severity === 2) return 'Medium'
  return 'Low'
}

function SeverityDots({ severity }: { severity: 1 | 2 | 3 }) {
  const color = SEVERITY_COLOR(severity)
  return (
    <span className="severity-dots">
      {([1, 2, 3] as const).map(i => (
        <span
          key={i}
          className="severity-dot"
          style={{ backgroundColor: i <= severity ? color : 'rgba(255,255,255,0.25)' }}
        />
      ))}
    </span>
  )
}

const STANCE_TOPICS = ['Housing', 'Healthcare', 'Immigration', 'Climate', 'Taxation', 'Education']

function StancesPanel() {
  return (
    <aside className="stances-panel">
      <h2 className="section-heading">Key Stances</h2>
      <div className="stances-list">
        {STANCE_TOPICS.map(topic => (
          <div className="stance-row" key={topic}>
            <span className="stance-topic">{topic}</span>
            <div className="stance-bar-track" />
          </div>
        ))}
      </div>
      <p className="stances-coming-soon">Coming soon</p>
    </aside>
  )
}

function ContradictionCard({ c }: { c: Contradiction }) {
  return (
    <div className="contradiction-card">
      <div className="contradiction-header">
        <span className="contradiction-topic">{c.topic.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span className="contradiction-severity">
          <SeverityDots severity={c.severity} />
          <span className="severity-label" style={{ color: SEVERITY_COLOR(c.severity) }}>
            {SEVERITY_LABEL(c.severity)}
          </span>
        </span>
      </div>
      <div className="quote-block quote-a">
        <p className="quote-text">"{c.quote_a}"</p>
        <span className="quote-date">Dáil, {c.quote_a_date}</span>
      </div>
      <div className="vs-divider">
        <div className="vs-line" />
        <span className="vs-text">VS</span>
        <div className="vs-line" />
      </div>
      <div className="quote-block quote-b">
        <p className="quote-text">"{c.quote_b}"</p>
        <span className="quote-date">Dáil, {c.quote_b_date}</span>
      </div>
      {c.explanation && (
        <div className="contradiction-explanation">
          <span className="explanation-label">Analysis</span>
          <p className="explanation-text">{c.explanation}</p>
        </div>
      )}
    </div>
  )
}

export default function PoliticianPage({
  politician,
  party,
  onBack,
}: {
  politician: Politician
  party: Party
  onBack: () => void
}) {
  const contradictionScore = politician.contradictionScore ?? 0
  const followThrough = 100 - contradictionScore
  const contradictions = (politician.contradictions ?? [])
    .slice()
    .sort((a, b) => b.severity - a.severity)

  // rank within party by follow-through (highest = 1st)
  const partyRank = [...party.people]
    .sort((a, b) => (b.contradictionScore != null && a.contradictionScore != null)
      ? a.contradictionScore - b.contradictionScore : 0)
    .findIndex(p => p.name === politician.name) + 1

  return (
    <div className="app politician-mode">
      <header className="politician-header">
        <button className="back-btn" onClick={onBack}>← Back to {party.name}</button>
        <div className="politician-hero" style={{ borderLeftColor: party.color }}>
          <div className="politician-avatar" style={{ borderColor: party.color }}>
            {politician.photo
              ? <img src={politician.photo} alt={politician.name} />
              : <span>{politician.name.charAt(0)}</span>}
          </div>
          <div className="politician-meta">
            <h1 className="politician-name">{politician.name}</h1>
            {politician.title && (
              <p className="politician-title">{politician.title}</p>
            )}
            {politician.role && (
              <p className="politician-constituency">{politician.role}</p>
            )}
            <span
              className="politician-party-badge"
              style={{ borderColor: party.color, color: party.color }}
            >
              {party.name}
            </span>
          </div>
          <div className="politician-grade-block">
            <span className="politician-grade" style={{ color: SCORE_COLOR(followThrough) }}>
              {GRADE(followThrough)}
            </span>
            <span className="politician-rank">
              {ordinal(partyRank)} in {party.name}
            </span>
          </div>
        </div>
      </header>

      <main className="politician-main">
        <div className="politician-body">
          <div className="politician-content">
            <div className="score-section">
              <div className="score-row">
                <span className="score-section-label">Follow Through Score</span>
                <span className="score-value" style={{ color: SCORE_COLOR(followThrough) }}>
                  {followThrough}
                </span>
                <span
                  className="score-badge"
                  style={{ color: SCORE_COLOR(followThrough), borderColor: SCORE_COLOR(followThrough) }}
                >
                  {SCORE_LABEL(followThrough)}
                </span>
              </div>
              <div className="score-track">
                <div
                  className="score-fill"
                  style={{ width: `${followThrough}%`, backgroundColor: SCORE_COLOR(followThrough) }}
                />
              </div>
            </div>

            {contradictions.length === 0 ? (
              <p className="no-contradictions">No contradiction data available for this TD.</p>
            ) : (
              <section className="contradictions-section">
                <h2 className="section-heading">
                  {contradictions.length === 1 ? '1 Contradiction' : `${contradictions.length} Contradictions`}
                </h2>
                <div className="contradictions-list">
                  {contradictions.map((c, i) => (
                    <ContradictionCard key={i} c={c} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <StancesPanel />
        </div>
      </main>
    </div>
  )
}
