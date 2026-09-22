import { Link } from 'react-router-dom'
import type { Tournament } from '../types'

export default function TournamentCard({ t }: { t: Tournament }) {
  const slotsLeft = t.teamCount - t.registeredTeams
  const prize = t.championPrize || t.prizeDescription || 'Custom Prizes'
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: 'var(--text-lg)' }}>{t.name}</h3>
        <span className="badge badge-approved">{t.game}</span>
      </div>
      <div style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
        প্রাইজ: {prize} · {slotsLeft} টিম স্লট বাকি
      </div>
      <Link to={`/tournaments/${t.id}`} className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
        বিস্তারিত দেখো
      </Link>
    </div>
  )
}
