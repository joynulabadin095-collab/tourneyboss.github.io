import { useState } from 'react'
import {
  getEntryPayments, updateEntryPayment,
  getHostingRequests, updateHostingRequest,
  getCashouts, updateCashout,
  getTournaments, saveTournament,
  getUsers, saveUser,
} from '../data/store'

type Tab = 'entries' | 'hosting' | 'cashouts'

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('entries')
  const [, forceRender] = useState(0)
  const refresh = () => forceRender(n => n + 1)

  const entries = getEntryPayments().filter(p => p.status === 'pending')
  const hosting = getHostingRequests().filter(r => r.status === 'pending')
  const cashouts = getCashouts().filter(c => c.status === 'pending')

  function approveEntry(id: string) {
    const p = getEntryPayments().find(x => x.id === id)
    if (!p) return
    updateEntryPayment({ ...p, status: 'approved' })
    const t = getTournaments().find(x => x.id === p.tournamentId)
    if (t) saveTournament({ ...t, filledSlots: t.filledSlots + 1 })
    refresh()
  }

  function rejectEntry(id: string) {
    const p = getEntryPayments().find(x => x.id === id)
    if (!p) return
    updateEntryPayment({ ...p, status: 'rejected' })
    refresh()
  }

  function approveHosting(id: string) {
    const r = getHostingRequests().find(x => x.id === id)
    if (!r) return
    updateHostingRequest({ ...r, status: 'approved' })
    const t = getTournaments().find(x => x.organizerId === r.organizerId && x.title === r.tournamentTitle)
    if (t) saveTournament({ ...t, status: 'open', hostingApproved: true })
    refresh()
  }

  function rejectHosting(id: string) {
    const r = getHostingRequests().find(x => x.id === id)
    if (!r) return
    updateHostingRequest({ ...r, status: 'rejected' })
    refresh()
  }

  function approveCashout(id: string) {
    const c = getCashouts().find(x => x.id === id)
    if (!c) return
    updateCashout({ ...c, status: 'approved' })
    const user = getUsers().find(u => u.id === c.playerId)
    if (user) saveUser({ ...user, walletBalance: user.walletBalance - c.amount })
    refresh()
  }

  function rejectCashout(id: string) {
    const c = getCashouts().find(x => x.id === id)
    if (!c) return
    updateCashout({ ...c, status: 'rejected' })
    refresh()
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Admin প্যানেল</h1>

      <div style={{ display: 'flex', gap: 10, margin: '20px 0', flexWrap: 'wrap' }}>
        <button className={tab === 'entries' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('entries')}>
          Entry Fee ({entries.length})
        </button>
        <button className={tab === 'hosting' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('hosting')}>
          Hosting Fee ({hosting.length})
        </button>
        <button className={tab === 'cashouts' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('cashouts')}>
          Cash-out ({cashouts.length})
        </button>
      </div>

      {tab === 'entries' && (
        <div className="card">
          <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Player</th><th>টুর্নামেন্ট</th><th>পরিমাণ</th><th>মাধ্যম</th><th>Ref</th><th></th></tr></thead>
            <tbody>
              {entries.map(p => (
                <tr key={p.id}>
                  <td>{p.playerName}</td><td>{p.tournamentId}</td><td>৳{p.amount}</td>
                  <td>{p.method}</td><td>{p.transactionRef}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => approveEntry(p.id)}>Approve</button>
                    <button className="btn btn-danger" onClick={() => rejectEntry(p.id)}>Reject</button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && <tr><td colSpan={6} style={{ color: 'var(--text-dim)' }}>Pending কিছু নেই</td></tr>}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === 'hosting' && (
        <div className="card">
          <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Organizer</th><th>টুর্নামেন্ট</th><th>ফি</th><th>মাধ্যম</th><th>Ref</th><th></th></tr></thead>
            <tbody>
              {hosting.map(r => (
                <tr key={r.id}>
                  <td>{r.organizerName}</td><td>{r.tournamentTitle}</td><td>৳{r.hostingFee}</td>
                  <td>{r.method}</td><td>{r.transactionRef}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => approveHosting(r.id)}>Approve</button>
                    <button className="btn btn-danger" onClick={() => rejectHosting(r.id)}>Reject</button>
                  </td>
                </tr>
              ))}
              {hosting.length === 0 && <tr><td colSpan={6} style={{ color: 'var(--text-dim)' }}>Pending কিছু নেই</td></tr>}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === 'cashouts' && (
        <div className="card">
          <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Player</th><th>পরিমাণ</th><th>মাধ্যম</th><th>Account</th><th></th></tr></thead>
            <tbody>
              {cashouts.map(c => (
                <tr key={c.id}>
                  <td>{c.playerName}</td><td>💎{c.amount}</td><td>{c.method}</td><td>{c.accountNumber}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => approveCashout(c.id)}>Approve</button>
                    <button className="btn btn-danger" onClick={() => rejectCashout(c.id)}>Reject</button>
                  </td>
                </tr>
              ))}
              {cashouts.length === 0 && <tr><td colSpan={5} style={{ color: 'var(--text-dim)' }}>Pending কিছু নেই</td></tr>}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
