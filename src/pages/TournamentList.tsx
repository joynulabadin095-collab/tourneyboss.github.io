import { getTournaments } from '../data/store'
import TournamentCard from '../components/TournamentCard'

export default function TournamentList() {
  const tournaments = getTournaments()

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>সব টুর্নামেন্ট</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 20 }}>
        {tournaments.length === 0 && <p style={{ color: 'var(--text-dim)' }}>কোনো টুর্নামেন্ট নেই।</p>}
        {tournaments.map(t => <TournamentCard key={t.id} t={t} />)}
      </div>
    </div>
  )
}
