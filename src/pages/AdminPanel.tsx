import { useEffect, useState } from 'react'
import {
  getPendingEntryPayments, approveEntryPayment, rejectEntryPayment,
  getPendingHostingRequests, approveHostingRequest, rejectHostingRequest,
  getPendingCashouts, approveCashout, rejectCashout,
  getPendingDeposits, approveDeposit, rejectDeposit,
} from '../data/store'
import type { EntryPayment, HostingRequest, CashoutRequest, Deposit } from '../types'

type Tab = 'deposits' | 'entries' | 'hosting' | 'cashouts'

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('deposits')
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [entries, setEntries] = useState<EntryPayment[]>([])
  const [hosting, setHosting] = useState<HostingRequest[]>([])
  const [cashouts, setCashouts] = useState<CashoutRequest[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  function loadAll() {
    getPendingDeposits().then(setDeposits)
    getPendingEntryPayments().then(setEntries)
    getPendingHostingRequests().then(setHosting)
    getPendingCashouts().then(setCashouts)
  }

  async function approveDep(id: string) {
    await approveDeposit(id)
    loadAll()
  }

  async function rejectDep(id: string) {
    await rejectDeposit(id)
    loadAll()
  }

  async function approveEntry(id: string) {
    await approveEntryPayment(id)
    loadAll()
  }

  async function rejectEntry(id: string) {
    await rejectEntryPayment(id)
    loadAll()
  }

  async function approveHosting(id: string) {
    await approveHostingRequest(id)
    loadAll()
  }

  async function rejectHosting(id: string) {
    await rejectHostingRequest(id)
    loadAll()
  }

  async function approveCashoutReq(id: string) {
    await approveCashout(id)
    loadAll()
  }

  async function rejectCashoutReq(id: string) {
    await rejectCashout(id)
    loadAll()
  }

  return (
    <div className="container" style={{ padding: 'var(--space-8) 0' }}>
      <h1>Admin প্যানেল</h1>

      <div style={{ display: 'flex', gap: 'var(--space-2)', margin: 'var(--space-6) 0', flexWrap: 'wrap' }}>
        <button className={tab === 'deposits' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('deposits')}>
          Deposits ({deposits.length})
        </button>
        <button className={tab === 'entries' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('entries')}>
          Entry Fee ({entries.length})
        </button>
        <button className={tab === 'hosting' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('hosting')}>
          Hosting Fee ({hosting.length})
        </button>
        <button className={tab === 'cashouts' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('cashouts')}>
          Withdraw ({cashouts.length})
        </button>
      </div>

      {tab === 'deposits' && (
        <div className="card">
          <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Player</th><th>পরিমাণ</th><th>মাধ্যম</th><th>TrxID</th><th></th></tr></thead>
            <tbody>
              {deposits.map(d => (
                <tr key={d.id}>
                  <td>{d.playerName}</td><td>৳{d.amount}</td>
                  <td>{d.method}</td><td>{d.transactionRef}</td>
                  <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-primary" onClick={() => approveDep(d.id)}>Approve</button>
                    <button className="btn btn-danger" onClick={() => rejectDep(d.id)}>Reject</button>
                  </td>
                </tr>
              ))}
              {deposits.length === 0 && <tr><td colSpan={5} style={{ color: 'var(--text-dim)' }}>Pending কিছু নেই</td></tr>}
            </tbody>
          </table>
          </div>
        </div>
      )}

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
                  <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
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
                  <td>{r.organizerName}</td><td>{r.tournamentName}</td><td>৳{r.hostingFee}</td>
                  <td>{r.method}</td><td>{r.transactionRef}</td>
                  <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
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
            <thead><tr><th>Player</th><th>পরিমাণ</th><th>পাঠাতে হবে</th><th>মাধ্যম</th><th>Account</th><th></th></tr></thead>
            <tbody>
              {cashouts.map(c => (
                <tr key={c.id}>
                  <td>{c.playerName}</td><td>৳{c.amount}</td><td><strong>৳{c.receivableAmount}</strong></td>
                  <td>{c.method}</td><td>{c.accountNumber}</td>
                  <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-primary" onClick={() => approveCashoutReq(c.id)}>Approve</button>
                    <button className="btn btn-danger" onClick={() => rejectCashoutReq(c.id)}>Reject</button>
                  </td>
                </tr>
              ))}
              {cashouts.length === 0 && <tr><td colSpan={6} style={{ color: 'var(--text-dim)' }}>Pending কিছু নেই</td></tr>}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
