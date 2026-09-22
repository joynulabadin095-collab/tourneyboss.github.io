import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getTournaments, getTournament, getMyHostingRequests, submitHostingRequest,
} from '../data/store'
import type { Tournament, HostingRequest } from '../types'

const HOSTING_FEE = 200 // fixed platform hosting fee per tournament (must match backend HOSTING_FEE env)

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const [lookupId, setLookupId] = useState('')
  const [foundTournament, setFoundTournament] = useState<Tournament | null>(null)
  const [method, setMethod] = useState<'bKash' | 'Bank'>('bKash')
  const [ref, setRef] = useState('')
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([])
  const [myHostingRequests, setMyHostingRequests] = useState<HostingRequest[]>([])
  const [error, setError] = useState('')
  const [lookupError, setLookupError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    if (!user) return
    getTournaments().then(list => setMyTournaments(list.filter(t => t.organizerId === user.uid)))
    getMyHostingRequests().then(setMyHostingRequests)
  }

  if (!user) return null

  async function findTournament(e: FormEvent) {
    e.preventDefault()
    setLookupError('')
    setFoundTournament(null)
    try {
      const t = await getTournament(lookupId.trim())
      if (t.organizerId !== user!.uid) {
        setLookupError('এটা তোমার তৈরি করা টুর্নামেন্ট না')
        return
      }
      setFoundTournament(t)
    } catch {
      setLookupError('এই ID-র টুর্নামেন্ট পাওয়া যায়নি')
    }
  }

  async function submitHostingFee(e: FormEvent) {
    e.preventDefault()
    if (!foundTournament) return
    setError('')
    try {
      await submitHostingRequest({ tournamentId: foundTournament.id, method, transactionRef: ref })
      setFoundTournament(null)
      setLookupId('')
      setRef('')
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'জমা দেয়া যায়নি')
    }
  }

  return (
    <div className="container" style={{ padding: 'var(--space-8) 0' }}>
      <h1>Organizer ড্যাশবোর্ড</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
        টুর্নামেন্ট তৈরি/এডিট এখন শুধু Tourney Boss App-এই হয়। এখানে শুধু hosting fee জমা দেয়া যায় — App-এ যে টুর্নামেন্ট বানিয়েছো তার ID বসিয়ে খুঁজে নাও।
      </p>

      <div className="two-col-grid" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card">
          <h3>টুর্নামেন্ট খুঁজে বের করো</h3>
          <form onSubmit={findTournament}>
            <div className="field">
              <label>Tournament ID (App থেকে কপি করো)</label>
              <input value={lookupId} onChange={e => setLookupId(e.target.value)} required />
            </div>
            {lookupError && <p style={{ color: 'var(--danger)' }}>{lookupError}</p>}
            <button className="btn btn-outline" type="submit">খুঁজো</button>
          </form>
        </div>

        <div className="card">
          <h3>Hosting fee জমা দাও</h3>
          {foundTournament ? (
            <form onSubmit={submitHostingFee}>
              <p style={{ color: 'var(--text-dim)' }}>"{foundTournament.name}" এর জন্য ৳{HOSTING_FEE} হোস্টিং ফি</p>
              <div className="field"><label>মাধ্যম</label>
                <select value={method} onChange={e => setMethod(e.target.value as 'bKash' | 'Bank')}>
                  <option value="bKash">bKash</option>
                  <option value="Bank">Bank</option>
                </select></div>
              <div className="field"><label>Transaction ID</label>
                <input value={ref} onChange={e => setRef(e.target.value)} required /></div>
              {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
              <button className="btn btn-primary" type="submit">জমা দাও</button>
            </form>
          ) : (
            <p style={{ color: 'var(--text-dim)' }}>বাম পাশে Tournament ID দিয়ে খুঁজে নিলে এখানে hosting fee জমা দেয়ার ফর্ম আসবে।</p>
          )}

          <h4 style={{ marginTop: 'var(--space-6)' }}>Hosting রিকোয়েস্ট হিস্টোরি</h4>
          <div className="table-wrap">
          <table className="table">
            <thead><tr><th>টুর্নামেন্ট</th><th>ফি</th><th>স্ট্যাটাস</th></tr></thead>
            <tbody>
              {myHostingRequests.map(r => (
                <tr key={r.id}>
                  <td>{r.tournamentName}</td>
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

      <div className="card" style={{ marginTop: 'var(--space-4)' }}>
        <h3>আমার টুর্নামেন্টগুলো (App-এ তৈরি)</h3>
        <div className="table-wrap">
        <table className="table">
          <thead><tr><th>নাম</th><th>টিম স্লট</th><th>স্ট্যাটাস</th></tr></thead>
          <tbody>
            {myTournaments.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.registeredTeams}/{t.teamCount}</td>
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
