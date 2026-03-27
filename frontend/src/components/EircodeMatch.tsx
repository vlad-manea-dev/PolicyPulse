import { useState } from 'react'
import { PARTIES } from '../data/parties'
import { getRegionFromEircode, IssueWeights } from '../data/eircodes'
import './EircodeMatch.css'

const ISSUE_LABELS: Record<keyof IssueWeights, string> = {
  housing: 'Housing',
  costOfLiving: 'Cost of Living',
  healthcare: 'Healthcare',
  agriculture: 'Agriculture',
  climate: 'Climate',
  infrastructure: 'Infrastructure',
  publicServices: 'Public Services',
  borderIssues: 'Border & Unity',
}

function scoreParty(partyStances: IssueWeights, regionIssues: IssueWeights): number {
  const keys = Object.keys(regionIssues) as (keyof IssueWeights)[]
  const totalWeight = keys.reduce((sum, k) => sum + regionIssues[k], 0)
  const weightedScore = keys.reduce((sum, k) => sum + partyStances[k] * regionIssues[k], 0)
  return Math.round((weightedScore / (totalWeight * 10)) * 100)
}

function topIssues(regionIssues: IssueWeights, n = 3): (keyof IssueWeights)[] {
  return (Object.keys(regionIssues) as (keyof IssueWeights)[])
    .sort((a, b) => regionIssues[b] - regionIssues[a])
    .slice(0, n)
}

function validateEircode(value: string): boolean {
  const cleaned = value.replace(/\s/g, '').toUpperCase()
  return /^[ACDEFHKNPRTVWXY]\d[\dW][A-Z0-9]{4}$/.test(cleaned) || /^D\d{2}[A-Z0-9]{4}$/.test(cleaned)
}

export default function EircodeMatch() {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [results, setResults] = useState<null | ReturnType<typeof computeResults>>(null)

  function computeResults(eircode: string) {
    const region = getRegionFromEircode(eircode)
    if (!region) return null

    const scored = PARTIES.map(party => ({
      party,
      score: scoreParty(party.stances as IssueWeights, region.issues),
    })).sort((a, b) => b.score - a.score)

    return { region, scored, topIss: topIssues(region.issues) }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!input.trim()) { setError('Please enter an Eircode.'); return }
    if (!validateEircode(input)) { setError('That doesn\'t look like a valid Eircode (e.g. D01, A94, H91).'); return }
    const res = computeResults(input)
    if (!res) { setError('We couldn\'t find a region for that Eircode.'); return }
    setResults(res)
  }

  return (
    <section className="eircode-section">
      <div className="eircode-header">
        <h2 className="eircode-title">Find Your Party Match</h2>
        <p className="eircode-subtitle">
          Enter your Eircode and we'll rank parties by how much their policies address the issues that matter most in your area.
        </p>
      </div>

      <form className="eircode-form" onSubmit={handleSubmit}>
        <input
          className="eircode-input"
          type="text"
          placeholder="e.g. D01, A94 T8P8, H91 Y832"
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); setResults(null) }}
          maxLength={10}
          spellCheck={false}
        />
        <button className="eircode-btn" type="submit">Match →</button>
      </form>

      {error && <p className="eircode-error">{error}</p>}

      {results && (
        <div className="eircode-results">
          <div className="region-banner">
            <span className="region-name">{results.region.name}</span>
            <span className="region-issues">
              Top issues: {results.topIss.map(k => ISSUE_LABELS[k]).join(' · ')}
            </span>
          </div>

          <div className="match-list">
            {results.scored.map(({ party, score }, idx) => (
              <div key={party.id} className={`match-row ${idx === 0 ? 'match-top' : ''}`}>
                <span className="match-rank" style={{ color: idx === 0 ? party.color : '#888' }}>
                  {idx === 0 ? '★' : `#${idx + 1}`}
                </span>
                <div className="match-logo">
                  {party.logoUrl
                    ? <img src={party.detailLogoUrl ?? party.logoUrl} alt={party.name} />
                    : <span style={{ color: party.color, fontWeight: 900 }}>{party.logoText}</span>}
                </div>
                <div className="match-info">
                  <span className="match-party-name">{party.name}</span>
                  <div className="match-bar-wrap">
                    <div
                      className="match-bar-fill"
                      style={{ width: `${score}%`, backgroundColor: party.color }}
                    />
                  </div>
                </div>
                <span className="match-score" style={{ color: party.color }}>{score}%</span>
              </div>
            ))}
          </div>

          <p className="match-note">
            Match score is based on how strongly each party's platform addresses your area's top issues. It reflects stated positions, not promises kept.
          </p>
        </div>
      )}
    </section>
  )
}
