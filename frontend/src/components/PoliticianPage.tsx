import { Politician, Party, Contradiction } from '../data/parties'
import './PoliticianPage.css'

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
  const score = politician.contradictionScore ?? 0
  const contradictions = (politician.contradictions ?? [])
    .slice()
    .sort((a, b) => b.severity - a.severity)

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
        </div>
      </header>

      <main className="politician-main">
        <div className="politician-body">
          <div className="politician-content">
            <div className="score-section">
              <div className="score-row">
                <span className="score-section-label">Contradiction Score</span>
                <span className="score-value" style={{ color: SCORE_COLOR(score) }}>
                  {score}
                </span>
                <span
                  className="score-badge"
                  style={{ color: SCORE_COLOR(score), borderColor: SCORE_COLOR(score) }}
                >
                  {SCORE_LABEL(score)}
                </span>
              </div>
              <div className="score-track">
                <div
                  className="score-fill"
                  style={{ width: `${score}%`, backgroundColor: SCORE_COLOR(score) }}
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
