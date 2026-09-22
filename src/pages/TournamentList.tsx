import { useEffect, useState } from 'react'
import { getTournaments } from '../data/store'
import TournamentCard from '../components/TournamentCard'
import type { Tournament } from '../types'

export default function TournamentList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTournaments().then(setTournaments).finally(() => setLoading(false))
  }, [])

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>সব টুর্নামেন্ট</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 20 }}>
        {loading && <p style={{ color: 'var(--text-dim)' }}>লোড হচ্ছে...</p>}
        {!loading && tournaments.length === 0 && <p style={{ color: 'var(--text-dim)' }}>কোনো টুর্নামেন্ট নেই।</p>}
        {tournaments.map(t => <TournamentCard key={t.id} t={t} />)}
      </div>
    </div>
  )
}
