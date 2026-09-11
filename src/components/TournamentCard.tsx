import { Link } from 'react-router-dom'
import type { Tournament } from '../types'

export default function TournamentCard({ t }: { t: Tournament }) {
  const slotsLeft = t.maxSlots - t.filledSlots
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: '1.05rem' }}>{t.title}</h3>
        <span className="badge badge-approved">{t.game}</span>
      </div>
      <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        Entry ৳{t.entryFee} · প্রাইজ পুল 💎{t.prizePool} · {slotsLeft} স্লট বাকি
      </div>
      <Link to={`/tournaments/${t.id}`} className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
        বিস্তারিত দেখো
      </Link>
    </div>
  )
}
