import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyEntryPayments, getMyCashouts, submitCashout } from '../data/store'
import type { EntryPayment, CashoutRequest } from '../types'

export default function PlayerDashboard() {
  const { user, refresh } = useAuth()
  const [method, setMethod] = useState<'bKash' | 'Bank'>('bKash')
  const [account, setAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [myEntries, setMyEntries] = useState<EntryPayment[]>([])
  const [myCashouts, setMyCashouts] = useState<CashoutRequest[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    getMyEntryPayments().then(setMyEntries)
    getMyCashouts().then(setMyCashouts)
  }

  if (!user) return null

  async function requestCashout(e: FormEvent) {
    e.preventDefault()
    setError('')
    const amt = Number(amount)
    if (!user || !amt || amt > user.walletBalance) return
    try {
      await submitCashout({ amount: amt, method, accountNumber: account })
      setAmount('')
      setAccount('')
      loadData()
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'রিকোয়েস্ট করা যায়নি')
    }
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>আমার ড্যাশবোর্ড</h1>

      <div className="two-col-grid" style={{ marginTop: 20 }}>
        <div className="card">
          <h3>ওয়ালেট ব্যালেন্স</h3>
          <p style={{ fontSize: '2rem', color: 'var(--gold)', margin: 0 }}>💎 {user.walletBalance}</p>

          <form onSubmit={requestCashout} style={{ marginTop: 16 }}>
            <div className="field">
              <label>Cash-out পরিমাণ</label>
              <input type="number" min={1} max={user.walletBalance} value={amount}
                onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="field">
              <label>মাধ্যম</label>
              <select value={method} onChange={e => setMethod(e.target.value as 'bKash' | 'Bank')}>
                <option value="bKash">bKash</option>
                <option value="Bank">Bank</option>
              </select>
            </div>
            <div className="field">
              <label>অ্যাকাউন্ট / নম্বর</label>
              <input value={account} onChange={e => setAccount(e.target.value)} required />
            </div>
            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
            <button className="btn btn-primary" type="submit">Cash-out রিকোয়েস্ট করো</button>
          </form>
        </div>

        <div className="card">
          <h3>Cash-out history</h3>
          <div className="table-wrap">
          <table className="table">
            <thead><tr><th>পরিমাণ</th><th>মাধ্যম</th><th>স্ট্যাটাস</th></tr></thead>
            <tbody>
              {myCashouts.map(c => (
                <tr key={c.id}>
                  <td>💎{c.amount}</td>
                  <td>{c.method}</td>
                  <td><span className={`badge badge-${c.status === 'approved' ? 'approved' : c.status === 'rejected' ? 'rejected' : 'pending'}`}>{c.status}</span></td>
                </tr>
              ))}
              {myCashouts.length === 0 && <tr><td colSpan={3} style={{ color: 'var(--text-dim)' }}>কোনো রিকোয়েস্ট নেই</td></tr>}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Entry fee history</h3>
        <div className="table-wrap">
        <table className="table">
          <thead><tr><th>টুর্নামেন্ট</th><th>পরিমাণ</th><th>মাধ্যম</th><th>স্ট্যাটাস</th></tr></thead>
          <tbody>
            {myEntries.map(p => (
              <tr key={p.id}>
                <td>{p.tournamentId}</td>
                <td>৳{p.amount}</td>
                <td>{p.method}</td>
                <td><span className={`badge badge-${p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending'}`}>{p.status}</span></td>
              </tr>
            ))}
            {myEntries.length === 0 && <tr><td colSpan={4} style={{ color: 'var(--text-dim)' }}>এখনো কোনো টুর্নামেন্টে জয়েন করোনি</td></tr>}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
