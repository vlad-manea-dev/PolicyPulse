import { Politician, Party, Contradiction } from '../data/parties'
import './PoliticianPage.css'

// truthScore = 100 - contradictionScore, higher is better
const SCORE_LABEL = (ts: number): string => {
  if (ts >= 80) return 'Excellent'
  if (ts >= 60) return 'Good'
  if (ts >= 40) return 'Mixed'
  if (ts >= 20) return 'Poor'
  return 'Very Poor'
}

const SCORE_COLOR = (ft: number): string => {
  if (ft >= 80) return '#287556'
  if (ft >= 60) return '#4a773c'
  if (ft >= 40) return '#b08a00'
  if (ft >= 20) return '#c0622a'
  return '#b02a2a'
}

const GRADE = (truthScore: number): string => {
  if (truthScore >= 90) return 'A+'
  if (truthScore >= 80) return 'A'
  if (truthScore >= 70) return 'B'
  if (truthScore >= 60) return 'C'
  if (truthScore >= 50) return 'D'
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

interface StanceEntry { topic: string; label: string }

const PARTY_STANCES: Record<string, StanceEntry[]> = {
  'fianna-fail': [
    { topic: 'Housing', label: 'Market-led supply; opposes rent freezes' },
    { topic: 'Healthcare', label: 'Sláintecare backer; public-private mix' },
    { topic: 'Immigration', label: 'Managed integration; community-first' },
    { topic: 'Climate', label: 'Gradual transition; protect agriculture' },
    { topic: 'Taxation', label: 'Low corporate tax; broad income base' },
    { topic: 'Education', label: 'Status quo funding; expand apprenticeships' },
  ],
  'fine-gael': [
    { topic: 'Housing', label: 'Supply-side incentives; developer-friendly' },
    { topic: 'Healthcare', label: 'Public-private partnership model' },
    { topic: 'Immigration', label: 'Capacity-based; tighter processing' },
    { topic: 'Climate', label: 'Technology-led; pro nuclear debate' },
    { topic: 'Taxation', label: 'Fiscal discipline; resist new taxes' },
    { topic: 'Education', label: 'Skills & enterprise; STEM investment' },
  ],
  'sinn-fein': [
    { topic: 'Housing', label: 'Massive public build; ban rent increases' },
    { topic: 'Healthcare', label: 'Universal free healthcare; end two-tier' },
    { topic: 'Immigration', label: 'Rights-based; oppose direct provision' },
    { topic: 'Climate', label: 'Just transition; protect rural workers' },
    { topic: 'Taxation', label: 'Wealth tax; raise corporate rate' },
    { topic: 'Education', label: 'Abolish student fees; fund DEIS' },
  ],
  'labour': [
    { topic: 'Housing', label: 'Cost rental; affordable homes fund' },
    { topic: 'Healthcare', label: 'Strengthen public system; GP access' },
    { topic: 'Immigration', label: 'Pro-integration; adequate resourcing' },
    { topic: 'Climate', label: 'Ring-fence carbon tax for retrofits' },
    { topic: 'Taxation', label: 'Progressive income tax; close loopholes' },
    { topic: 'Education', label: 'DEIS expansion; reduce class sizes' },
  ],
  'social-democrats': [
    { topic: 'Housing', label: 'State-led building; Vienna model' },
    { topic: 'Healthcare', label: 'Universal GP care; cut waiting lists' },
    { topic: 'Immigration', label: 'Integration support; end direct provision' },
    { topic: 'Climate', label: 'Ambitious 2030 targets; retrofit push' },
    { topic: 'Taxation', label: 'Evidence-based reform; broaden base' },
    { topic: 'Education', label: 'Early years investment; free childcare' },
  ],
  'green-party': [
    { topic: 'Housing', label: 'Compact growth; sustainable communities' },
    { topic: 'Healthcare', label: 'Preventative focus; active travel' },
    { topic: 'Immigration', label: 'Pro-integration; community supports' },
    { topic: 'Climate', label: 'Climate emergency; end fossil fuels' },
    { topic: 'Taxation', label: 'Carbon tax champion; polluter pays' },
    { topic: 'Education', label: 'Green schools; climate literacy' },
  ],
}

function StancesPanel({ party }: { party: Party }) {
  const stances = PARTY_STANCES[party.id] ?? []
  return (
    <aside className="stances-panel">
      <h2 className="section-heading">Key Stances</h2>
      <div className="stances-list">
        {stances.map(s => (
          <div className="stance-row" key={s.topic}>
            <span className="stance-topic">{s.topic}</span>
            <span className="stance-label">{s.label}</span>
          </div>
        ))}
      </div>
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
  const truthScore = 100 - contradictionScore
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
          <div className="politician-grade-block">
            <span className="politician-grade" style={{ color: SCORE_COLOR(truthScore) }}>
              {GRADE(truthScore)}
            </span>
          </div>
        </div>
      </header>

      <main className="politician-main">
        <div className="politician-body">
          <div className="politician-content">
            <div className="score-section">
              <div className="score-row">
                <span className="score-section-label">Truth Score</span>
                <span className="score-value" style={{ color: SCORE_COLOR(truthScore) }}>
                  {truthScore}
                </span>
                <span
                  className="score-badge"
                  style={{ color: SCORE_COLOR(truthScore), borderColor: SCORE_COLOR(truthScore) }}
                >
                  {SCORE_LABEL(truthScore)}
                </span>
              </div>
              <div className="score-track" style={{ '--unfilled': `${100 - truthScore}%` } as React.CSSProperties}>
                <div
                  className="score-fill"
                  style={{ width: `${truthScore}%`, backgroundColor: SCORE_COLOR(truthScore) }}
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

          <StancesPanel party={party} />
        </div>
      </main>
    </div>
  )
}
