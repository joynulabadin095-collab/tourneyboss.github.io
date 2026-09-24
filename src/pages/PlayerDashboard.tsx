import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getMyEntryPayments, getMyCashouts, submitCashout,
  getMyDeposits, submitDeposit,
} from '../data/store'
import type { EntryPayment, CashoutRequest, Deposit, PaymentMethod } from '../types'
import { PLATFORM_FEE_RATE } from '../types'
import { ADMIN_PAYMENT_NUMBERS } from '../config'

type MobileMethod = Exclude<PaymentMethod, 'Bank'>

function feePreview(amount: string) {
  const amt = Number(amount)
  if (!amt || amt <= 0) return null
  const fee = Math.round(amt * PLATFORM_FEE_RATE * 100) / 100
  return { amt, fee, net: Math.round((amt - fee) * 100) / 100 }
}

export default function PlayerDashboard() {
  const { user, refresh } = useAuth()

  // Deposit form
  const [depMethod, setDepMethod] = useState<MobileMethod>('bKash')
  const [depAmount, setDepAmount] = useState('')
  const [depTrxId, setDepTrxId] = useState('')
  const [depError, setDepError] = useState('')
  const [depSuccess, setDepSuccess] = useState(false)
  const [myDeposits, setMyDeposits] = useState<Deposit[]>([])

  // Withdraw form
  const [method, setMethod] = useState<MobileMethod>('bKash')
  const [account, setAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [myCashouts, setMyCashouts] = useState<CashoutRequest[]>([])
  const [error, setError] = useState('')

  const [myEntries, setMyEntries] = useState<EntryPayment[]>([])

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    getMyEntryPayments().then(setMyEntries)
    getMyCashouts().then(setMyCashouts)
    getMyDeposits().then(setMyDeposits)
  }

  if (!user) return null

  const depositPreview = feePreview(depAmount)
  const withdrawPreview = feePreview(amount)

  async function requestDeposit(e: FormEvent) {
    e.preventDefault()
    setDepError('')
    setDepSuccess(false)
    const amt = Number(depAmount)
    if (!amt || amt <= 0 || !depTrxId.trim()) return
    try {
      await submitDeposit({ amount: amt, method: depMethod, transactionRef: depTrxId.trim() })
      setDepAmount('')
      setDepTrxId('')
      setDepSuccess(true)
      loadData()
    } catch (err) {
      setDepError(err instanceof Error ? err.message : 'ডিপোজিট সাবমিট করা যায়নি')
    }
  }

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
    <div className="container" style={{ padding: 'var(--space-8) 0' }}>
      <h1>আমার ড্যাশবোর্ড</h1>

      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h3>ওয়ালেট ব্যালেন্স</h3>
        <p style={{ fontSize: 'var(--text-2xl)', color: 'var(--gold)', margin: 0 }}>৳ {user.walletBalance}</p>
      </div>

      <div className="two-col-grid" style={{ marginTop: 'var(--space-4)' }}>
        {/* --- Deposit --- */}
        <div className="card">
          <h3>ডিপোজিট করো</h3>
          <form onSubmit={requestDeposit} style={{ marginTop: 'var(--space-4)' }}>
            <div className="field">
              <label>মাধ্যম</label>
              <select value={depMethod} onChange={e => setDepMethod(e.target.value as MobileMethod)}>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
              </select>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
              এই নাম্বারে Send Money করো: <strong>{ADMIN_PAYMENT_NUMBERS[depMethod]}</strong>
            </p>
            <div className="field">
              <label>যত টাকা পাঠিয়েছো (৳)</label>
              <input type="number" min={1} value={depAmount} onChange={e => setDepAmount(e.target.value)} required />
            </div>
            <div className="field">
              <label>Transaction ID (TrxID)</label>
              <input value={depTrxId} onChange={e => setDepTrxId(e.target.value)} placeholder="যেমন 9J83KL921" required />
            </div>
            {depositPreview && (
              <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
                সার্ভিস ফি (2%): -৳{depositPreview.fee} • ওয়ালেটে জমা হবে: ৳{depositPreview.net}
              </p>
            )}
            {depError && <p style={{ color: 'var(--danger)' }}>{depError}</p>}
            {depSuccess && <p style={{ color: 'var(--gold)' }}>সাবমিট হয়েছে — Admin ভেরিফাই করার পর ব্যালেন্স যোগ হবে</p>}
            <button className="btn btn-primary" type="submit">ডিপোজিট রিকোয়েস্ট করো</button>
          </form>
        </div>

        {/* --- Withdraw --- */}
        <div className="card">
          <h3>Withdraw করো</h3>
          <form onSubmit={requestCashout} style={{ marginTop: 'var(--space-4)' }}>
            <div className="field">
              <label>Withdraw পরিমাণ (৳)</label>
              <input type="number" min={1} max={user.walletBalance} value={amount}
                onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="field">
              <label>মাধ্যম</label>
              <select value={method} onChange={e => setMethod(e.target.value as MobileMethod)}>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
              </select>
            </div>
            <div className="field">
              <label>তোমার {method} নাম্বার</label>
              <input value={account} onChange={e => setAccount(e.target.value)} placeholder="01XXXXXXXXX" required />
            </div>
            {withdrawPreview && (
              <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
                প্রসেসিং ফি (2%): -৳{withdrawPreview.fee} • তুমি পাবে: ৳{withdrawPreview.net}
              </p>
            )}
            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
            <button className="btn btn-primary" type="submit">Withdraw রিকোয়েস্ট করো</button>
          </form>
        </div>
      </div>

      <div className="two-col-grid" style={{ marginTop: 'var(--space-4)' }}>
        <div className="card">
          <h3>Deposit history</h3>
          <div className="table-wrap">
          <table className="table">
            <thead><tr><th>পরিমাণ</th><th>মাধ্যম</th><th>জমা হয়েছে</th><th>স্ট্যাটাস</th></tr></thead>
            <tbody>
              {myDeposits.map(d => (
                <tr key={d.id}>
                  <td>৳{d.amount}</td>
                  <td>{d.method}</td>
                  <td>{d.creditedAmount != null ? `৳${d.creditedAmount}` : '—'}</td>
                  <td><span className={`badge badge-${d.status === 'approved' ? 'approved' : d.status === 'rejected' ? 'rejected' : 'pending'}`}>{d.status}</span></td>
                </tr>
              ))}
              {myDeposits.length === 0 && <tr><td colSpan={4} style={{ color: 'var(--text-dim)' }}>কোনো ডিপোজিট নেই</td></tr>}
            </tbody>
          </table>
          </div>
        </div>

        <div className="card">
          <h3>Withdraw history</h3>
          <div className="table-wrap">
          <table className="table">
            <thead><tr><th>পরিমাণ</th><th>মাধ্যম</th><th>স্ট্যাটাস</th></tr></thead>
            <tbody>
              {myCashouts.map(c => (
                <tr key={c.id}>
                  <td>৳{c.amount}</td>
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

      <div className="card" style={{ marginTop: 'var(--space-4)' }}>
        <h3>Entry fee history</h3>
        <div className="table-wrap">
        <table className="table">
          <thead><tr><th>টুর্নামেন্ট</th><th>পরিমাণ</th><th>মাধ্যম</th><th>স্ট্যাটাস</th><th>Verification Code</th></tr></thead>
          <tbody>
            {myEntries.map(p => (
              <tr key={p.id}>
                <td>{p.tournamentId}</td>
                <td>৳{p.amount}</td>
                <td>{p.method}</td>
                <td><span className={`badge badge-${p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending'}`}>{p.status}</span></td>
                <td>{p.verificationToken ? <strong style={{ color: 'var(--gold)' }}>{p.verificationToken}</strong> : '—'}</td>
              </tr>
            ))}
            {myEntries.length === 0 && <tr><td colSpan={5} style={{ color: 'var(--text-dim)' }}>এখনো কোনো টুর্নামেন্টে জয়েন করোনি</td></tr>}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
