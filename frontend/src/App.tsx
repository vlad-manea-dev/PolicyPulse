import { useState } from 'react'
import './App.css'
import { PARTIES, Party, Politician } from './data/parties'
import PodiumAnimation from './components/PodiumAnimation'

export default function App() {
  const [view, setView] = useState<'home' | 'party'>('home')
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)

  const handlePartyClick = (party: Party) => {
    setSelectedParty(party)
    setView('party')
  }

  const handleBack = () => {
    setView('home')
    setSelectedParty(null)
  }

  const handlePersonClick = (p: Politician) => {
    // Later we can wire this up to the actual promise search logic
    console.log("Clicked", p.name)
  }

  if (view === 'party' && selectedParty) {
    return (
      <div className="app">
        <header>
          <button className="back-btn" onClick={handleBack}>← Back to Parties</button>
          <h1>{selectedParty.name}</h1>
          <p className="subtitle">Key representatives and politicians</p>
        </header>
        <main>
          <div className="party-page-header" style={{ borderColor: selectedParty.color }}>
            <div className="party-page-logo">
              {selectedParty.logoUrl ? <img src={selectedParty.logoUrl} alt={selectedParty.name} /> : selectedParty.logoText}
            </div>
            <h2>The Team</h2>
          </div>
          
          <div className="party-people-large" style={{ borderColor: selectedParty.color }}>
            <div className="people-grid-large">
              {selectedParty.people.map((person, idx) => (
                <button 
                  key={idx} 
                  className="person-card-large"
                  onClick={() => handlePersonClick(person)}
                >
                  <div className="person-avatar-large" style={{ backgroundColor: selectedParty.color }}>
                    {person.name.charAt(0)}
                  </div>
                  <div className="person-info-large">
                    <div className="person-name">{person.name}</div>
                    <div className="person-role">{person.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }
  return (
    <div className="app home-mode">
      <header className="home-header">
        <div className="header-text">
          <h1>Promise Tracker</h1>
          <p className="subtitle">Did they keep their word? Checked against the Dáil record.</p>
        </div>
        <div className="header-animation">
          <PodiumAnimation />
        </div>
      </header>

      <main className="centered-main">
        <section className="parties-section">
          <div className="parties-grid centered-grid">
            {PARTIES.map(party => (
              <button 
                key={party.id} 
                className="party-card"
                style={{ 
                  borderColor: party.color,
                  color: party.color
                }}
                onClick={() => handlePartyClick(party)}
              >
                <div className="party-logo">
                  {party.logoUrl ? <img src={party.logoUrl} alt={party.name} /> : <div className="party-text-fallback">{party.logoText}</div>}
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
