import { useEffect, useState, type FormEvent } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { getTournament, submitEntryPayment, payEntryFromWallet } from '../data/store'
import { useAuth } from '../context/AuthContext'
import type { Tournament } from '../types'

export default function TournamentDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [t, setT] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'bKash' | 'Bank'>('bKash')
  const [ref, setRef] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [walletBusy, setWalletBusy] = useState(false)
  const [walletError, setWalletError] = useState('')

  useEffect(() => {
    if (!id) return
    getTournament(id)
      .then(setT)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (notFound) return <Navigate to="/tournaments" replace />
  if (loading || !t) {
    return <div className="container" style={{ padding: 'var(--space-8) 0' }}><p style={{ color: 'var(--text-dim)' }}>লোড হচ্ছে...</p></div>
  }

  const prize = t.championPrize || t.prizeDescription || 'Custom Prizes'
  const slotsLeft = t.teamCount - t.registeredTeams

  async function submitEntry(e: FormEvent) {
    e.preventDefault()
    if (!user || !t) return
    setError('')
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      setError('সঠিক amount দাও')
      return
    }
    try {
      await submitEntryPayment({ tournamentId: t.id, amount: amt, method, transactionRef: ref })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'জমা দেয়া যায়নি')
    }
  }

  async function handleWalletPay() {
    if (!user || !t) return
    setWalletError('')
    setWalletBusy(true)
    try {
      await payEntryFromWallet(t.id)
      setSubmitted(true)
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'পেমেন্ট করা যায়নি')
    } finally {
      setWalletBusy(false)
    }
  }

  return (
    <div className="container details-grid" style={{ padding: 'var(--space-8) 0' }}>
      <div>
        <h1>{t.name}</h1>
        <p style={{ color: 'var(--text-dim)' }}>{t.game}{t.gameMode ? ` · ${t.gameMode}` : ''}</p>
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <h3>বিস্তারিত ও নিয়মাবলী</h3>
          {t.description && <p style={{ color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>{t.description}</p>}
          {t.rules && <p style={{ color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>{t.rules}</p>}
        </div>
      </div>

      <div className="card">
        <h3>Entry Fee জমা দাও</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
          প্রাইজ: {prize} · {slotsLeft} টিম স্লট বাকি
        </p>
        <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>
          Entry fee-এর পরিমাণ টুর্নামেন্টের বিবরণে (উপরে) দেখো, তারপর bKash/Bank-এ পাঠিয়ে নিচে জমা দাও।
        </p>

        {!user && <p>জয়েন করতে <a href="/login">লগইন</a> করো।</p>}

        {user?.role === 'member' && !submitted && t.isPaid && t.entryFee ? (
          <div className="card" style={{ marginBottom: 'var(--space-4)', background: 'var(--surface-2)' }}>
            <p style={{ margin: 0 }}>
              এই টুর্নামেন্টের entry fee <strong style={{ color: 'var(--gold)' }}>৳{t.entryFee}</strong> —
              সরাসরি তোমার ওয়ালেট থেকে কেটে নেওয়া যাবে।
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
              তোমার ওয়ালেট ব্যালেন্স: ৳{user.walletBalance}
            </p>
            {user.walletBalance >= t.entryFee ? (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleWalletPay} disabled={walletBusy}>
                {walletBusy ? 'পেমেন্ট হচ্ছে...' : `ওয়ালেট থেকে ৳${t.entryFee} দাও`}
              </button>
            ) : (
              <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>
                ওয়ালেটে যথেষ্ট টাকা নেই — আগে <Link to="/player">Deposit করো</Link>।
              </p>
            )}
            {walletError && <p style={{ color: 'var(--danger)' }}>{walletError}</p>}
          </div>
        ) : null}

        {user?.role === 'member' && !submitted && (
          <>
            {t.isPaid && t.entryFee && (
              <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>
                অথবা bKash/Bank দিয়ে সরাসরি জমা দাও:
              </p>
            )}
            <form onSubmit={submitEntry}>
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
              <input value={ref} onChange={e => setRef(e.target.value)} required
                placeholder="যেমন: 8N7X2K1P" />
            </div>
            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
            <button className="btn btn-primary" type="submit">Entry fee জমা দাও</button>
          </form>
          </>
        )}

        {submitted && (
          <div>
            <p className="badge badge-pending">জমা হয়েছে — Admin verify করলে একটা কোড পাবে</p>
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
              Approve হলে "আমার ড্যাশবোর্ড"-এ একটা verification code দেখাবে — সেটা App-এ টিম রেজিস্ট্রেশনের সময় বসিয়ে দিও।
            </p>
          </div>
        )}

        {user?.role === 'organizer' || user?.role === 'admin' ? (
          <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>
            শুধু player অ্যাকাউন্ট দিয়ে entry fee জমা দেয়া যায়।
          </p>
        ) : null}
      </div>
    </div>
  )
}
