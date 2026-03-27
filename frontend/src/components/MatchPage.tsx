import { useState, useMemo } from 'react'
import { PARTIES } from '../data/parties'
import { getRegionFromEircode, IssueWeights } from '../data/eircodes'
import './MatchPage.css'

const ISSUES: { key: keyof IssueWeights; label: string; description: string }[] = [
  { key: 'housing',        label: 'Housing',          description: 'Affordable homes, rent controls, social housing' },
  { key: 'costOfLiving',   label: 'Cost of Living',   description: 'Inflation, energy bills, grocery prices' },
  { key: 'healthcare',     label: 'Healthcare',        description: 'Hospital waiting lists, GP access, mental health' },
  { key: 'agriculture',    label: 'Agriculture',       description: 'Farming supports, rural development, CAP' },
  { key: 'climate',        label: 'Climate',           description: 'Emissions targets, renewable energy, green transport' },
  { key: 'infrastructure', label: 'Infrastructure',    description: 'Roads, public transport, broadband' },
  { key: 'publicServices', label: 'Public Services',   description: 'Schools, childcare, social welfare' },
  { key: 'borderIssues',   label: 'Border & Unity',   description: 'Irish unity, North-South relations, Brexit impact' },
]

function scoreParty(stances: IssueWeights, weights: IssueWeights): number {
  const keys = Object.keys(weights) as (keyof IssueWeights)[]
  const totalWeight = keys.reduce((sum, k) => sum + weights[k], 0)
  if (totalWeight === 0) return 0
  const weighted = keys.reduce((sum, k) => sum + stances[k] * weights[k], 0)
  return Math.round((weighted / (totalWeight * 10)) * 100)
}

function topMatchingIssues(stances: IssueWeights, weights: IssueWeights, n = 2): string[] {
  return (Object.keys(weights) as (keyof IssueWeights)[])
    .filter(k => weights[k] > 0)
    .sort((a, b) => (stances[b] * weights[b]) - (stances[a] * weights[a]))
    .slice(0, n)
    .map(k => ISSUES.find(i => i.key === k)!.label)
}

function avgContradictionScore(partyId: string): number {
  const party = PARTIES.find(p => p.id === partyId)
  if (!party) return 0
  const scores = party.people.map(p => p.contradictionScore ?? 0)
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

function contradictionColor(score: number): string {
  if (score >= 70) return '#b02a2a'
  if (score >= 50) return '#c0622a'
  return '#4a773c'
}

const DEFAULT_WEIGHTS: IssueWeights = {
  housing: 5, costOfLiving: 5, healthcare: 5, agriculture: 5,
  climate: 5, infrastructure: 5, publicServices: 5, borderIssues: 5,
}

export default function MatchPage({ onBack }: { onBack: () => void }) {
  const [eircode, setEircode] = useState('')
  const [region, setRegion] = useState<ReturnType<typeof getRegionFromEircode>>(null)
  const [weights, setWeights] = useState<IssueWeights>(DEFAULT_WEIGHTS)
  const [eircodeError, setEircodeError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleEircodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEircodeError('')
    const r = getRegionFromEircode(eircode)
    if (!r) { setEircodeError('Could not find a region for that Eircode.'); return }
    setRegion(r)
    setWeights({ ...r.issues })
    setSubmitted(true)
  }

  const results = useMemo(() => {
    return PARTIES
      .map(party => ({
        party,
        score: scoreParty(party.stances as IssueWeights, weights),
        topIssues: topMatchingIssues(party.stances as IssueWeights, weights),
        contradiction: avgContradictionScore(party.id),
      }))
      .sort((a, b) => b.score - a.score)
  }, [weights])

  const topScore = results[0]?.score ?? 100

  return (
    <div className="app match-page-mode">
      <header>
        <button className="back-btn" onClick={onBack}>← Back to Parties</button>
        <h1>Find Your Match</h1>
        <p className="subtitle">Enter your Eircode, adjust what matters to you, and see which party best represents your priorities.</p>
      </header>

      <main className="match-main">
        {/* Left panel: Eircode + sliders */}
        <div className="match-left">

          {/* Eircode */}
          <div className="match-card">
            <h3 className="match-card-title">Your Location</h3>
            <form className="match-eircode-form" onSubmit={handleEircodeSubmit}>
              <input
                className="match-eircode-input"
                type="text"
                placeholder="Enter Eircode, e.g. D01, H91"
                value={eircode}
                onChange={e => { setEircode(e.target.value); setEircodeError(''); }}
                spellCheck={false}
                maxLength={10}
              />
              <button className="match-eircode-btn" type="submit">Detect →</button>
            </form>
            {eircodeError && <p className="match-error">{eircodeError}</p>}
            {region && (
              <div className="region-detected">
                <span className="region-dot" />
                <div>
                  <div className="region-detected-name">{region.name}</div>
                  <div className="region-detected-hint">Sliders pre-filled for your area — adjust to match your own priorities</div>
                </div>
              </div>
            )}
          </div>

          {/* Sliders */}
          <div className="match-card sliders-card">
            <h3 className="match-card-title">What Matters to You</h3>
            <div className="sliders-list">
              {ISSUES.map(({ key, label, description }) => (
                <div key={key} className="slider-row">
                  <div className="slider-label-row">
                    <span className="slider-label">{label}</span>
                    <span className="slider-value">{weights[key]}</span>
                  </div>
                  <p className="slider-description">{description}</p>
                  <div className="slider-track-wrap">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={weights[key]}
                      onChange={e => setWeights(w => ({ ...w, [key]: Number(e.target.value) }))}
                      className="slider-input"
                      style={{ '--val': weights[key] } as React.CSSProperties}
                    />
                    <div className="slider-ticks">
                      {Array.from({ length: 11 }, (_, i) => (
                        <span key={i} className={`tick ${i === weights[key] ? 'tick-active' : ''}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="reset-btn"
              onClick={() => setWeights(region ? { ...region.issues } : DEFAULT_WEIGHTS)}
            >
              {region ? 'Reset to my area defaults' : 'Reset to defaults'}
            </button>
          </div>
        </div>

        {/* Right panel: live results */}
        <div className="match-right">
          <div className="match-card results-card">
            <h3 className="match-card-title">
              Your Party Match
              {!submitted && <span className="results-hint"> — enter an Eircode or adjust sliders to begin</span>}
            </h3>

            <div className="results-list">
              {results.map(({ party, score, topIssues: ti, contradiction }, idx) => (
                <div
                  key={party.id}
                  className={`result-row ${idx === 0 ? 'result-top' : ''}`}
                  style={idx === 0 ? { borderColor: party.color } : {}}
                >
                  <div className="result-rank">
                    {idx === 0
                      ? <span className="result-star" style={{ color: party.color }}>★</span>
                      : <span className="result-num">#{idx + 1}</span>}
                  </div>

                  <div className="result-logo">
                    {party.logoUrl
                      ? <img src={party.detailLogoUrl ?? party.logoUrl} alt={party.name} />
                      : <span style={{ color: party.color, fontWeight: 900, fontSize: '0.85rem' }}>{party.logoText}</span>}
                  </div>

                  <div className="result-body">
                    <div className="result-name-row">
                      <span className="result-name">{party.name}</span>
                      <span className="result-pct" style={{ color: party.color }}>{score}%</span>
                    </div>

                    <div className="result-bar-wrap">
                      <div
                        className="result-bar-fill"
                        style={{
                          width: `${topScore > 0 ? (score / topScore) * 100 : 0}%`,
                          backgroundColor: party.color,
                        }}
                      />
                    </div>

                    <div className="result-meta">
                      {ti.length > 0 && (
                        <span className="result-issues">Strongest on: {ti.join(' · ')}</span>
                      )}
                      <span
                        className="result-contradiction"
                        style={{ color: contradictionColor(contradiction) }}
                      >
                        Avg contradiction: {contradiction}/100
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="match-disclaimer">
              Match scores reflect stated party positions weighted by your priorities. Contradiction scores show how often their TDs' voting records diverge from public promises.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
