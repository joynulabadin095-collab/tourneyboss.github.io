import { Link } from 'react-router-dom'
import type { Tournament } from '../types'

const STATUS_LABEL: Record<string, { label: string; cls: string; pulse?: boolean }> = {
  registration: { label: 'রেজিস্ট্রেশন চলছে', cls: 'open' },
  in_progress: { label: 'লাইভ', cls: 'live', pulse: true },
  completed: { label: 'শেষ হয়েছে', cls: 'soon' },
  draft: { label: 'শীঘ্রই শুরু', cls: 'soon' },
  archived: { label: 'আর্কাইভড', cls: 'soon' },
}

export default function TournamentCard({ t }: { t: Tournament }) {
  const slotsLeft = Math.max(0, t.teamCount - t.registeredTeams)
  const fillPct = t.teamCount > 0 ? Math.min(100, Math.round((t.registeredTeams / t.teamCount) * 100)) : 0
  const prize = t.championPrize || t.prizeDescription || 'Custom Prizes'
  const status = STATUS_LABEL[t.status] || STATUS_LABEL.draft

  return (
    <article className="t-card">
      <div className="t-head">
        <span className="t-game">🎮 {t.game}</span>
        <span className={`t-status ${status.cls}`}>
          {status.pulse && <span className="pulse" />}
          {status.label}
        </span>
      </div>

      <h3 className="t-title">{t.name}</h3>
      <div className="t-meta">
        <span>👥 {t.gameMode}</span>
      </div>

      <div className="t-prize">
        <div>
          <div className="lbl">প্রাইজ পুল</div>
          <div className="amt">{prize}</div>
        </div>
      </div>

      <div className="t-slots">
        <div className="t-slots-row">
          <span><b>{t.registeredTeams}</b>/{t.teamCount} টিম</span>
          <span style={{ color: 'var(--gold)' }}>{slotsLeft} স্লট বাকি</span>
        </div>
        <div className="progress"><div className="progress-fill" style={{ width: `${fillPct}%` }} /></div>
      </div>

      <div className="t-cta">
        <Link to={`/tournaments/${t.id}`} className="btn btn-primary">বিস্তারিত দেখো</Link>
      </div>
    </article>
  )
}
