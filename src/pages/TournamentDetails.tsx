import { useState, type FormEvent } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { getTournaments, addEntryPayment, newId } from '../data/store'
import { useAuth } from '../context/AuthContext'

export default function TournamentDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const t = getTournaments().find(x => x.id === id)
  const [method, setMethod] = useState<'bKash' | 'Bank'>('bKash')
  const [ref, setRef] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!t) return <Navigate to="/tournaments" replace />

  function submitEntry(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    addEntryPayment({
      id: newId('entry'),
      tournamentId: t.id,
      playerId: user.id,
      playerName: user.name,
      amount: t.entryFee,
      method,
      transactionRef: ref,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
    setSubmitted(true)
  }

  return (
    <div className="container" style={{ padding: '40px 0', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
      <div>
        <h1>{t.title}</h1>
        <p style={{ color: 'var(--text-dim)' }}>{t.game} · হোস্ট: {t.organizerName}</p>
        <div className="card" style={{ marginTop: 16 }}>
          <h3>নিয়মাবলী</h3>
          <p style={{ color: 'var(--text-dim)' }}>{t.rules}</p>
        </div>
      </div>

      <div className="card">
        <h3>Entry Fee ৳{t.entryFee}</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          প্রাইজ পুল: 💎{t.prizePool} · {t.maxSlots - t.filledSlots} স্লট বাকি
        </p>

        {!user && <p>জয়েন করতে <a href="/login">লগইন</a> করো।</p>}

        {user?.role === 'player' && !submitted && (
          <form onSubmit={submitEntry}>
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
            <button className="btn btn-primary" type="submit">Entry fee জমা দাও</button>
          </form>
        )}

        {submitted && (
          <p className="badge badge-pending">জমা হয়েছে — Admin verify করলে স্লট কনফার্ম হবে</p>
        )}

        {user?.role === 'organizer' || user?.role === 'admin' ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            শুধু player অ্যাকাউন্ট দিয়ে entry fee জমা দেয়া যায়।
          </p>
        ) : null}
      </div>
    </div>
  )
}
