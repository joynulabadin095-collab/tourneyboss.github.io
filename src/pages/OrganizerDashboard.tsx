import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getTournaments, createTournament, getMyHostingRequests, submitHostingRequest,
} from '../data/store'
import type { Tournament, HostingRequest } from '../types'

const HOSTING_FEE = 200 // fixed platform hosting fee per tournament (must match backend HOSTING_FEE env)

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
  const [pendingTournament, setPendingTournament] = useState<Tournament | null>(null)
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([])
  const [myHostingRequests, setMyHostingRequests] = useState<HostingRequest[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    if (!user) return
    getTournaments().then(list => setMyTournaments(list.filter(t => t.organizerId === user.uid)))
    getMyHostingRequests().then(setMyHostingRequests)
  }

  if (!user) return null

  async function createDraft(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const tournament = await createTournament({
        title, game,
        entryFee: Number(entryFee),
        prizePool: Number(prizePool),
        maxSlots: Number(maxSlots),
        startsAt,
        rules,
      })
      setPendingTournament(tournament)
      setTitle(''); setGame(''); setEntryFee(''); setPrizePool(''); setMaxSlots(''); setStartsAt(''); setRules('')
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'তৈরি করা যায়নি')
    }
  }

  async function submitHostingFee(e: FormEvent) {
    e.preventDefault()
    if (!pendingTournament) return
    setError('')
    try {
      await submitHostingRequest({ tournamentId: pendingTournament.id, method, transactionRef: ref })
      setPendingTournament(null)
      setRef('')
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'জমা দেয়া যায়নি')
    }
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Organizer ড্যাশবোর্ড</h1>

      <div className="two-col-grid" style={{ marginTop: 20 }}>
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
            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
            <button className="btn btn-primary" type="submit">Draft তৈরি করো</button>
          </form>
        </div>

        <div className="card">
          <h3>Hosting fee জমা দাও</h3>
          {pendingTournament ? (
            <form onSubmit={submitHostingFee}>
              <p style={{ color: 'var(--text-dim)' }}>"{pendingTournament.title}" এর জন্য ৳{HOSTING_FEE} হোস্টিং ফি</p>
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
          <div className="table-wrap">
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
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>আমার টুর্নামেন্টগুলো</h3>
        <div className="table-wrap">
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
    </div>
  )
}
