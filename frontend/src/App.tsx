import { useState } from 'react'
import './App.css'
import { PARTIES, Party, Politician } from './data/parties'
import PodiumAnimation from './components/PodiumAnimation'
import PoliticalCompass from './components/PoliticalCompass'
import LeaderboardPage from './components/LeaderboardPage'
import PoliticianPage from './components/PoliticianPage'
import MatchPage from './components/MatchPage'
import WinsPage from './components/WinsPage'
import Navbar from './components/Navbar'

type View = 'home' | 'party' | 'leaderboard' | 'politician' | 'match' | 'wins'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null)

  const handlePartyClick = (party: Party) => {
    setSelectedParty(party)
    setView('party')
  }

  const handlePersonClick = (p: Politician) => {
    setSelectedPolitician(p)
    setView('politician')
  }

  const handleNavChange = (v: View) => {
    setSelectedParty(null)
    setSelectedPolitician(null)
    setView(v)
  }

  const renderContent = () => {
    if (view === 'leaderboard') {
      return <LeaderboardPage />
    }

    if (view === 'match') {
      return <MatchPage />
    }

    if (view === 'wins') {
      return <WinsPage />
    }

    if (view === 'politician' && selectedPolitician && selectedParty) {
      return (
        <PoliticianPage
          politician={selectedPolitician}
          party={selectedParty}
          onBack={() => { setSelectedPolitician(null); setView('party') }}
        />
      )
    }

    if (view === 'party' && selectedParty) {
      return (
        <div className="page-content party-mode">
          <div className="party-page-inner">
            <button className="back-btn" onClick={() => { setSelectedParty(null); setView('home') }}>
              ← All Parties
            </button>
            <header className="party-header">
              <h1>{selectedParty.name}</h1>
              <p className="subtitle">Key representatives and politicians</p>
            </header>

            <div className="party-overview">
              <div className="party-logo-block">
                <div className="party-page-logo">
                  {(selectedParty.detailLogoUrl || selectedParty.logoUrl)
                    ? <img src={selectedParty.detailLogoUrl ?? selectedParty.logoUrl} alt={selectedParty.name} />
                    : <span style={{ color: selectedParty.color }}>{selectedParty.logoText}</span>}
                </div>
              </div>
              <div className="party-description-block">
                <p className="party-description">{selectedParty.description}</p>
              </div>
              <div className="party-compass-block">
                <h3 className="compass-title">Political Compass</h3>
                <PoliticalCompass
                  economic={selectedParty.compass.economic}
                  social={selectedParty.compass.social}
                  color={selectedParty.color}
                  partyName={selectedParty.name}
                />
              </div>
            </div>

            <div className="party-team-section" style={{ borderColor: selectedParty.color }}>
              <h2>The Team</h2>
              <div className="people-grid-large">
                {selectedParty.people.map((person, idx) => (
                  <button
                    key={idx}
                    className="person-card-large"
                    onClick={() => handlePersonClick(person)}
                  >
                    <div className="person-avatar-large" style={{ backgroundColor: selectedParty.color }}>
                      {person.photo
                        ? <img src={person.photo} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                        : person.name.charAt(0)}
                    </div>
                    <div className="person-info-large">
                      <div className="person-name">{person.name}</div>
                      {person.title && <div className="person-title">{person.title}</div>}
                      <div className="person-role">{person.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Home
    return (
      <div className="page-content home-mode">
        <header className="home-header">
          <div className="header-animation">
            <PodiumAnimation />
          </div>
          <div className="header-text">
            <h1>PolicyPulse</h1>
            <p className="tagline">Politicians make promises. We check if they kept them.</p>
            <p className="subtitle">Pick a party to see what their TDs pledged, and what the Dáil record says.</p>
          </div>
        </header>

        <main className="centered-main">
          <section className="parties-section">
            <div className="parties-grid centered-grid">
              {PARTIES.map(party => (
                <button
                  key={party.id}
                  className="party-card"
                  style={{ borderColor: party.color, color: party.color }}
                  onClick={() => handlePartyClick(party)}
                >
                  <div className="party-logo">
                    {party.logoUrl
                      ? <img src={party.logoUrl} alt={party.name} />
                      : <div className="party-text-fallback">{party.logoText}</div>}
                  </div>
                  {!party.logoUrl && <div className="party-name">{party.name}</div>}
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Navbar view={view} setView={handleNavChange} />
      {renderContent()}
    </div>
  )
}
