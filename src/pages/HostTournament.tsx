import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { submitOrganizerRequest, getMyOrganizerRequests } from '../data/store'
import type { OrganizerRequest } from '../types'

const STATUS_LABEL: Record<string, string> = {
  pending: '⏳ পর্যালোচনায় আছে',
  approved: '✅ অনুমোদিত',
  rejected: '❌ প্রত্যাখ্যাত',
}

export default function HostTournament() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<OrganizerRequest[]>([])
  const [loading, setLoading] = useState(true)

  const [tournamentName, setTournamentName] = useState('')
  const [game, setGame] = useState('')
  const [gameMode, setGameMode] = useState('')
  const [teamCount, setTeamCount] = useState('')
  const [entryFee, setEntryFee] = useState('')
  const [registrationDeadline, setRegistrationDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState('')
  const [championPrize, setChampionPrize] = useState('')
  const [runnerUpPrize, setRunnerUpPrize] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function loadRequests() {
    getMyOrganizerRequests().then(setRequests).finally(() => setLoading(false))
  }

  useEffect(() => { if (user) loadRequests() }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await submitOrganizerRequest({
        tournamentName,
        game,
        gameMode,
        teamCount: Number(teamCount),
        entryFee: Number(entryFee),
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
        description,
        rules,
        prizeDescription: null,
        championPrize: championPrize || null,
        runnerUpPrize: runnerUpPrize || null,
      })
      setDone(true)
      setTournamentName(''); setGame(''); setGameMode(''); setTeamCount('')
      setEntryFee(''); setRegistrationDeadline(''); setDescription(''); setRules(''); setChampionPrize(''); setRunnerUpPrize('')
      loadRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'জমা দেওয়া যায়নি')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="container" style={{ maxWidth: 480, padding: '60px 20px', textAlign: 'center' }}>
        <p>হোস্ট রিকোয়েস্ট পাঠাতে আগে <Link to="/login">লগইন</Link> করো।</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: 640, padding: '48px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <span className="pill-badge" style={{ marginBottom: 18 }}>
          <span className="dot" /> Paid টুর্নামেন্ট হোস্ট করো
        </span>
        <h1 className="gradient-text" style={{ fontSize: 'var(--text-xl)' }}>তোমার টুর্নামেন্ট প্রস্তাব করো</h1>
        <p style={{ color: 'var(--text-dim)' }}>
          Admin অনুমোদন করলেই তোমার Player role বদলে <strong style={{ color: 'var(--text)' }}>Organizer</strong> হয়ে
          যাবে এবং টুর্নামেন্টটা লাইভ হয়ে যাবে — এন্ট্রি ফি প্লেয়াররা এই ওয়েবসাইট থেকেই দেবে।
        </p>
      </div>

      <div className="glow-card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        {done && (
          <div className="card" style={{ background: 'rgba(61,214,140,0.1)', borderColor: 'var(--success)', marginBottom: 'var(--space-4)' }}>
            রিকোয়েস্ট জমা হয়েছে — Admin রিভিউ করার পর জানানো হবে।
          </div>
        )}
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>টুর্নামেন্টের নাম</label>
            <input value={tournamentName} onChange={e => setTournamentName(e.target.value)} required />
          </div>
          <div className="field">
            <label>গেম</label>
            <input value={game} onChange={e => setGame(e.target.value)} placeholder="যেমন: Mobile Legends" required />
          </div>
          <div className="field">
            <label>গেম মোড</label>
            <input value={gameMode} onChange={e => setGameMode(e.target.value)} placeholder="যেমন: 5v5 Squad" />
          </div>
          <div className="field">
            <label>মোট টিম সংখ্যা</label>
            <input type="number" min={2} value={teamCount} onChange={e => setTeamCount(e.target.value)} required />
          </div>
          <div className="field">
            <label>প্রতি টিমের Entry Fee (৳) — সবার জন্য একই থাকবে</label>
            <input type="number" min={1} value={entryFee} onChange={e => setEntryFee(e.target.value)} required />
          </div>
          <div className="field">
            <label>Registration Deadline (ঐচ্ছিক)</label>
            <input type="datetime-local" value={registrationDeadline} onChange={e => setRegistrationDeadline(e.target.value)} />
          </div>
          <div className="field">
            <label>চ্যাম্পিয়ন প্রাইজ</label>
            <input value={championPrize} onChange={e => setChampionPrize(e.target.value)} placeholder="যেমন: ৳৫,০০০" />
          </div>
          <div className="field">
            <label>রানার-আপ প্রাইজ</label>
            <input value={runnerUpPrize} onChange={e => setRunnerUpPrize(e.target.value)} placeholder="যেমন: ৳২,০০০" />
          </div>
          <div className="field">
            <label>বিস্তারিত বিবরণ</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} required />
          </div>
          <div className="field">
            <label>নিয়মকানুন</label>
            <textarea value={rules} onChange={e => setRules(e.target.value)} rows={3} />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'জমা হচ্ছে...' : 'রিকোয়েস্ট পাঠাও'}
          </button>
        </form>
      </div>

      <h3>তোমার আগের রিকোয়েস্ট</h3>
      {loading && <p style={{ color: 'var(--text-dim)' }}>লোড হচ্ছে...</p>}
      {!loading && requests.length === 0 && <p style={{ color: 'var(--text-dim)' }}>এখনো কোনো রিকোয়েস্ট নেই।</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {requests.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <strong>{r.tournamentName}</strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '.85rem' }}>{r.game} · Entry ৳{r.entryFee}</div>
            </div>
            <span>{STATUS_LABEL[r.status] ?? r.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
