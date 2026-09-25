import { Link } from 'react-router-dom'
import type { Tournament } from '../types'
import Countdown from './Countdown'

export const STATUS_LABEL: Record<string, { label: string; cls: string; pulse?: boolean }> = {
  registration: { label: 'রেজিস্ট্রেশন চলছে', cls: 'open' },
  in_progress: { label: 'লাইভ', cls: 'live', pulse: true },
  completed: { label: 'শেষ হয়েছে', cls: 'soon' },
  draft: { label: 'শীঘ্রই শুরু', cls: 'soon' },
  archived: { label: 'আর্কাইভড', cls: 'soon' },
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tourneyboss.player'

export default function TournamentCard({ t }: { t: Tournament }) {
  const slotsLeft = Math.max(0, t.teamCount - t.registeredTeams)
  const fillPct = t.teamCount > 0 ? Math.min(100, Math.round((t.registeredTeams / t.teamCount) * 100)) : 0
  const prize = t.championPrize || t.prizeDescription || 'Custom Prizes'
  const status = STATUS_LABEL[t.status] || STATUS_LABEL.draft
  const isPaid = !!t.isPaid

  return (
    <article className="t-card">
      <div className="t-head">
        <span className="t-game">🎮 {t.game}</span>
        <span className={`t-status ${status.cls}`}>
          {status.pulse && <span className="pulse" />}
          {status.label}
        </span>
      </div>

      {t.registrationDeadline && (
        <div style={{ marginBottom: 10 }}><Countdown deadline={t.registrationDeadline} compact /></div>
      )}

      <h3 className="t-title">{t.name}</h3>
      <div className="t-meta">
        <span>👥 {t.gameMode}</span>
        {isPaid ? (
          <span className="t-fee-badge paid">🔒 Entry ৳{t.entryFee ?? '—'}</span>
        ) : (
          <span className="t-fee-badge free">🆓 ফ্রি</span>
        )}
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
        {isPaid ? (
          <Link to={`/tournaments/${t.id}`} className="btn btn-primary">Entry fee দিয়ে জয়েন করো</Link>
        ) : (
          <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className="btn btn-outline">
            📱 অ্যাপ থেকে জয়েন করো (ফ্রি)
          </a>
        )}
      </div>
    </article>
  )
}
