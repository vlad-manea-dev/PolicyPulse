import './Navbar.css'

type View = 'home' | 'party' | 'leaderboard' | 'politician' | 'match' | 'wins'

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: 'home',        label: 'Parties' },
  { view: 'leaderboard', label: 'Leaderboard' },
  { view: 'wins',        label: 'Recent Wins' },
  { view: 'match',       label: 'Find Your Match' },
]

export default function Navbar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const activeTab = view === 'party' || view === 'politician' ? 'home' : view

  return (
    <nav className="navbar">
      <button className="navbar-brand" onClick={() => setView('home')}>
        <span className="navbar-logo">PP</span>
        <span className="navbar-title">PolicyPulse</span>
      </button>
      <div className="navbar-links">
        {NAV_ITEMS.map(item => (
          <button
            key={item.view}
            className={`navbar-link ${activeTab === item.view ? 'navbar-link-active' : ''}`}
            onClick={() => setView(item.view)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
