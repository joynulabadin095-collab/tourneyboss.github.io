import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getTournaments, saveTournament, getHostingRequests, addHostingRequest, newId,
} from '../data/store'

const HOSTING_FEE = 200 // fixed platform hosting fee per tournament

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [game, setGame] = useState('')
  const [entryFee, setEntryFee] = useState('')
  const [prizePool, setPrizePool] = useState('')
  const [maxSlots, setMaxSlots] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [rules, setRules] = useState('')
  const [method, setMethod] = useState<'bKash' | 'Bank'>('bKash')
  const [ref, setRef] = useState('')
  const [pendingTitle, setPendingTitle] = useState<string | null>(null)

  if (!user) return null

  const myTournaments = getTournaments().filter(t => t.organizerId === user.id)
  const myHostingRequests = getHostingRequests().filter(r => r.organizerId === user.id)

  function createDraft(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    const id = newId('tournament')
    saveTournament({
      id,
      title, game,
      organizerId: user.id,
      organizerName: user.name,
      entryFee: Number(entryFee),
      prizePool: Number(prizePool),
      maxSlots: Number(maxSlots),
      filledSlots: 0,
      startsAt,
      status: 'draft',
      hostingApproved: false,
      rules,
    })
    setPendingTitle(title)
    setTitle(''); setGame(''); setEntryFee(''); setPrizePool(''); setMaxSlots(''); setStartsAt(''); setRules('')
  }

  function submitHostingFee(e: FormEvent) {
    e.preventDefault()
    if (!user || !pendingTitle) return
    addHostingRequest({
      id: newId('hosting'),
      organizerId: user.id,
      organizerName: user.name,
      tournamentTitle: pendingTitle,
      hostingFee: HOSTING_FEE,
      method,
      transactionRef: ref,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
    setPendingTitle(null)
    setRef('')
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Organizer ড্যাশবোর্ড</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        <div className="card">
          <h3>নতুন টুর্নামেন্ট তৈরি করো</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Draft হিসেবে সেভ হবে — hosting fee (৳{HOSTING_FEE}) verify হওয়ার পর টুর্নামেন্ট live হবে।
          </p>
          <form onSubmit={createDraft}>
            <div className="field"><label>টুর্নামেন্টের নাম</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required /></div>
            <div className="field"><label>গেম</label>
              <input value={game} onChange={e => setGame(e.target.value)} required /></div>
            <div className="field"><label>Entry fee (৳)</label>
              <input type="number" value={entryFee} onChange={e => setEntryFee(e.target.value)} required /></div>
            <div className="field"><label>প্রাইজ পুল (💎)</label>
              <input type="number" value={prizePool} onChange={e => setPrizePool(e.target.value)} required /></div>
            <div className="field"><label>মোট স্লট</label>
              <input type="number" value={maxSlots} onChange={e => setMaxSlots(e.target.value)} required /></div>
            <div className="field"><label>শুরুর সময়</label>
              <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} required /></div>
            <div className="field"><label>নিয়মাবলী</label>
              <textarea rows={3} value={rules} onChange={e => setRules(e.target.value)} required /></div>
            <button className="btn btn-primary" type="submit">Draft তৈরি করো</button>
          </form>
        </div>

        <div className="card">
          <h3>Hosting fee জমা দাও</h3>
          {pendingTitle ? (
            <form onSubmit={submitHostingFee}>
              <p style={{ color: 'var(--text-dim)' }}>"{pendingTitle}" এর জন্য ৳{HOSTING_FEE} হোস্টিং ফি</p>
              <div className="field"><label>মাধ্যম</label>
                <select value={method} onChange={e => setMethod(e.target.value as 'bKash' | 'Bank')}>
                  <option value="bKash">bKash</option>
                  <option value="Bank">Bank</option>
                </select></div>
              <div className="field"><label>Transaction ID</label>
                <input value={ref} onChange={e => setRef(e.target.value)} required /></div>
              <button className="btn btn-primary" type="submit">জমা দাও</button>
            </form>
          ) : (
            <p style={{ color: 'var(--text-dim)' }}>নতুন টুর্নামেন্ট draft তৈরি করলে এখানে hosting fee জমা দেয়ার ফর্ম আসবে।</p>
          )}

          <h4 style={{ marginTop: 20 }}>Hosting রিকোয়েস্ট হিস্টোরি</h4>
          <table className="table">
            <thead><tr><th>টুর্নামেন্ট</th><th>ফি</th><th>স্ট্যাটাস</th></tr></thead>
            <tbody>
              {myHostingRequests.map(r => (
                <tr key={r.id}>
                  <td>{r.tournamentTitle}</td>
                  <td>৳{r.hostingFee}</td>
                  <td><span className={`badge badge-${r.status === 'approved' ? 'approved' : r.status === 'rejected' ? 'rejected' : 'pending'}`}>{r.status}</span></td>
                </tr>
              ))}
              {myHostingRequests.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--text-dim)' }}>কোনো রিকোয়েস্ট নেই</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>আমার টুর্নামেন্টগুলো</h3>
        <table className="table">
          <thead><tr><th>নাম</th><th>স্লট</th><th>স্ট্যাটাস</th></tr></thead>
          <tbody>
            {myTournaments.map(t => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.filledSlots}/{t.maxSlots}</td>
                <td><span className="badge badge-pending">{t.status}</span></td>
              </tr>
            ))}
            {myTournaments.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--text-dim)' }}>এখনো কোনো টুর্নামেন্ট নেই</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
