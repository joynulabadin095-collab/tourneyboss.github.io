import { useEffect, useState, type FormEvent } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { getTournament, submitEntryPayment, payEntryFromWallet } from '../data/store'
import { useAuth } from '../context/AuthContext'
import { STATUS_LABEL } from '../components/TournamentCard'
import Countdown from '../components/Countdown'
import type { Tournament } from '../types'

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tourneyboss.player'

type JoinStep = 'idle' | 'confirm' | 'success'

export default function TournamentDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [t, setT] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // bKash/Bank manual fallback form
  const [showManual, setShowManual] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'bKash' | 'Bank'>('bKash')
  const [ref, setRef] = useState('')
  const [manualSubmitted, setManualSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Wallet join-now flow
  const [joinStep, setJoinStep] = useState<JoinStep>('idle')
  const [walletBusy, setWalletBusy] = useState(false)
  const [walletError, setWalletError] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    getTournament(id).then(setT).catch(() => setNotFound(true)).finally(() => setLoading(false))
  }, [id])

  if (notFound) return <Navigate to="/tournaments" replace />
  if (loading || !t) {
    return <div className="container" style={{ padding: 'var(--space-8) 0' }}><p style={{ color: 'var(--text-dim)' }}>লোড হচ্ছে...</p></div>
  }

  const prize = t.championPrize || t.prizeDescription || 'Custom Prizes'
  const slotsLeft = Math.max(0, t.teamCount - t.registeredTeams)
  const fillPct = t.teamCount > 0 ? Math.min(100, Math.round((t.registeredTeams / t.teamCount) * 100)) : 0
  const status = STATUS_LABEL[t.status] || STATUS_LABEL.draft
  const isPaid = !!t.isPaid && !!t.entryFee

  async function handleWalletPay() {
    if (!user || !t) return
    setWalletError('')
    setWalletBusy(true)
    try {
      const payment = await payEntryFromWallet(t.id)
      setJoinCode(payment.verificationToken ?? '')
      setJoinStep('success')
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'পেমেন্ট করা যায়নি')
      setJoinStep('idle')
    } finally {
      setWalletBusy(false)
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function submitManual(e: FormEvent) {
    e.preventDefault()
    if (!user || !t) return
    setError('')
    const amt = Number(amount)
    if (!amt || amt <= 0) { setError('সঠিক amount দাও'); return }
    try {
      await submitEntryPayment({ tournamentId: t.id, amount: amt, method, transactionRef: ref })
      setManualSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'জমা দেয়া যায়নি')
    }
  }

  return (
    <div className="container" style={{ padding: 'var(--space-8) 0', maxWidth: 640 }}>
      {/* Hero */}
      <div className="live-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="live-card-head">
          <span className={`t-status ${status.cls}`}>{status.pulse && <span className="pulse" />}{status.label}</span>
          <span className="live-card-game">{t.game}</span>
        </div>
        <h1 className="live-card-title" style={{ fontSize: 'var(--text-xl)' }}>{t.name}</h1>
        <p className="live-card-meta">{t.gameMode}</p>

        {t.registrationDeadline && (
          <div style={{ margin: '4px 0 16px' }}>
            <div style={{ color: 'var(--text-dim)', fontSize: '.75rem', marginBottom: 6 }}>রেজিস্ট্রেশন শেষ হবে:</div>
            <Countdown deadline={t.registrationDeadline} />
          </div>
        )}

        <div className="prize-row">
          <div className="prize-block"><span className="label">প্রাইজ পুল</span><div className="value">{prize}</div></div>
          {isPaid && <div className="prize-block"><span className="label">Entry Fee</span><div className="value">৳{t.entryFee}</div></div>}
        </div>

        <div className="slots">
          <div className="slots-head">
            <span className="filled"><strong>{t.registeredTeams}</strong>/{t.teamCount} টিম যুক্ত হয়েছে</span>
            <span>{slotsLeft} স্লট বাকি</span>
          </div>
          <div className="progress"><div className="progress-fill" style={{ width: `${fillPct}%` }} /></div>
        </div>
      </div>

      {(t.description || t.rules) && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3>বিস্তারিত ও নিয়মাবলী</h3>
          {t.description && <p style={{ color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>{t.description}</p>}
          {t.rules && <p style={{ color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>{t.rules}</p>}
        </div>
      )}

      {!user && (
        <div className="card"><p style={{ margin: 0 }}>জয়েন করতে <Link to="/login">লগইন</Link> করো।</p></div>
      )}

      {/* FREE tournament — no payment on the website at all */}
      {user?.role === 'member' && !isPaid && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🆓 Free Tournament</h3>
          <p style={{ color: 'var(--text-dim)' }}>
            এই টুর্নামেন্টে কোনো entry fee নেই — ওয়েবসাইটে পেমেন্টের কিছু নেই। জয়েন করতে
            সরাসরি <strong style={{ color: 'var(--text)' }}>Tourney Boss App</strong> ব্যবহার করো।
          </p>
          <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-block' }}>
            📱 App এ জয়েন করো
          </a>
        </div>
      )}

      {/* PAID tournament — wallet join-now flow + bKash/Bank fallback */}
      {user?.role === 'member' && isPaid && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Entry Fee দাও</h3>

          {joinStep === 'idle' && (
            <>
              <p style={{ color: 'var(--text-dim)' }}>তোমার ওয়ালেট ব্যালেন্স: ৳{user.walletBalance}</p>
              {user.walletBalance >= (t.entryFee ?? 0) ? (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setJoinStep('confirm')}>
                  🎮 Join Now — ৳{t.entryFee}
                </button>
              ) : (
                <p style={{ color: 'var(--danger)' }}>ওয়ালেটে যথেষ্ট টাকা নেই — আগে <Link to="/wallet">Deposit করো</Link>।</p>
              )}
              {walletError && <p style={{ color: 'var(--danger)' }}>{walletError}</p>}

              <button
                className="btn btn-outline"
                style={{ width: '100%', marginTop: 10 }}
                onClick={() => setShowManual(s => !s)}
              >
                {showManual ? 'বন্ধ করো' : 'অথবা bKash/Bank দিয়ে জমা দাও'}
              </button>

              {showManual && !manualSubmitted && (
                <form onSubmit={submitManual} style={{ marginTop: 'var(--space-4)' }}>
                  <div className="field">
                    <label>যত টাকা পাঠিয়েছো (৳)</label>
                    <input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>পেমেন্ট মাধ্যম</label>
                    <select value={method} onChange={e => setMethod(e.target.value as 'bKash' | 'Bank')}>
                      <option value="bKash">bKash</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Transaction ID / রেফারেন্স</label>
                    <input value={ref} onChange={e => setRef(e.target.value)} required placeholder="যেমন: 8N7X2K1P" />
                  </div>
                  {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
                  <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>জমা দাও</button>
                </form>
              )}

              {manualSubmitted && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <p className="badge badge-pending">জমা হয়েছে — Admin verify করলে ড্যাশবোর্ডে কোড দেখাবে</p>
                </div>
              )}
            </>
          )}

          {joinStep === 'confirm' && (
            <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid var(--gold)', borderRadius: 'var(--radius)', padding: 16 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>
                ⚠️ তোমার ওয়ালেট থেকে <span style={{ color: 'var(--gold)' }}>৳{t.entryFee}</span> কেটে নেওয়া হবে।
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '.88rem' }}>এগোতে চাও?</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleWalletPay} disabled={walletBusy}>
                  {walletBusy ? 'হচ্ছে...' : 'Continue'}
                </button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setJoinStep('idle')} disabled={walletBusy}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {joinStep === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--success)', fontWeight: 600 }}>✅ পেমেন্ট সফল হয়েছে!</p>
              <p style={{ color: 'var(--text-dim)', fontSize: '.88rem' }}>
                এই কোডটি App-এ টিম রেজিস্ট্রেশনের সময় বসাও:
              </p>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '.05em',
                background: 'var(--surface-2)', border: '1px dashed var(--gold)', borderRadius: 10,
                padding: '14px 10px', color: 'var(--gold)', margin: '12px 0',
              }}>
                {joinCode}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={copyCode}>
                  {copied ? '✓ কপি হয়েছে' : '📋 কপি করো'}
                </button>
                <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1 }}>
                  📱 App খোলো
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {(user?.role === 'organizer' || user?.role === 'admin') && (
        <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>শুধু player অ্যাকাউন্ট দিয়ে entry fee জমা দেয়া যায়।</p>
      )}
    </div>
  )
}
