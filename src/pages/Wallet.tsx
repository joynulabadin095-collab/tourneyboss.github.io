import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyDeposits, submitDeposit, getMyCashouts, submitCashout } from '../data/store'
import type { Deposit, CashoutRequest, PaymentMethod } from '../types'
import { PLATFORM_FEE_RATE } from '../types'
import { ADMIN_PAYMENT_NUMBERS } from '../config'

type MobileMethod = Exclude<PaymentMethod, 'Bank'>
type Tab = 'deposit' | 'withdraw'

function feePreview(amount: string) {
  const amt = Number(amount)
  if (!amt || amt <= 0) return null
  const fee = Math.round(amt * PLATFORM_FEE_RATE * 100) / 100
  return { amt, fee, net: Math.round((amt - fee) * 100) / 100 }
}

export default function Wallet() {
  const { user, refresh } = useAuth()
  const [tab, setTab] = useState<Tab>('deposit')

  const [depMethod, setDepMethod] = useState<MobileMethod>('bKash')
  const [depAmount, setDepAmount] = useState('')
  const [depTrxId, setDepTrxId] = useState('')
  const [depError, setDepError] = useState('')
  const [depSuccess, setDepSuccess] = useState(false)
  const [myDeposits, setMyDeposits] = useState<Deposit[]>([])

  const [method, setMethod] = useState<MobileMethod>('bKash')
  const [account, setAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [myCashouts, setMyCashouts] = useState<CashoutRequest[]>([])
  const [error, setError] = useState('')

  function loadData() {
    getMyDeposits().then(setMyDeposits)
    getMyCashouts().then(setMyCashouts)
  }

  useEffect(() => { loadData() }, [])

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
      setDepAmount(''); setDepTrxId(''); setDepSuccess(true)
      loadData()
    } catch (err) {
      setDepError(err instanceof Error ? err.message : 'ডিপোজিট সাবমিট করা যায়নি')
    }
  }

  async function requestCashout(e: FormEvent) {
    e.preventDefault()
    setError('')
    const amt = Number(amount)
    if (!amt || amt > user.walletBalance) return
    try {
      await submitCashout({ amount: amt, method, accountNumber: account })
      setAmount(''); setAccount('')
      loadData(); refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'রিকোয়েস্ট করা যায়নি')
    }
  }

  return (
    <div className="container" style={{ padding: 'var(--space-8) 0', maxWidth: 640 }}>
      <h1>ওয়ালেট</h1>

      {/* Balance counter */}
      <div className="glow-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Available Balance
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem', color: 'var(--gold)', lineHeight: 1.2 }}>
              ৳{user.walletBalance}
            </div>
          </div>
          <span className="badge badge-approved">Active</span>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '.85rem', margin: '10px 0 0' }}>
          Entry fee পেমেন্টে স্বয়ংক্রিয়ভাবে খরচ হয়।
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 'var(--space-5)' }}>
          <button className={tab === 'deposit' ? 'btn btn-primary' : 'btn btn-outline'} style={{ flex: 1 }} onClick={() => setTab('deposit')}>
            ↙ Deposit
          </button>
          <button className={tab === 'withdraw' ? 'btn btn-primary' : 'btn btn-outline'} style={{ flex: 1 }} onClick={() => setTab('withdraw')}>
            ↗ Withdraw
          </button>
        </div>
      </div>

      {tab === 'deposit' ? (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3>Deposit করো</h3>
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
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Deposit রিকোয়েস্ট করো</button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3>Withdraw করো</h3>
          <form onSubmit={requestCashout} style={{ marginTop: 'var(--space-4)' }}>
            <div className="field">
              <label>Withdraw পরিমাণ (৳)</label>
              <input type="number" min={1} max={user.walletBalance} value={amount} onChange={e => setAmount(e.target.value)} required />
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
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Withdraw রিকোয়েস্ট করো</button>
          </form>
        </div>
      )}

      <h3>লেনদেনের ইতিহাস</h3>
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ধরন</th><th>পরিমাণ</th><th>মাধ্যম</th><th>স্ট্যাটাস</th></tr></thead>
            <tbody>
              {[...myDeposits.map(d => ({ ...d, kind: 'জমা' as const })), ...myCashouts.map(c => ({ ...c, kind: 'উত্তোলন' as const }))]
                .sort((a, b) => b.id.localeCompare(a.id))
                .map(t => (
                  <tr key={t.id}>
                    <td>{t.kind}</td>
                    <td>৳{t.amount}</td>
                    <td>{t.method}</td>
                    <td><span className={`badge badge-${t.status === 'approved' ? 'approved' : t.status === 'rejected' ? 'rejected' : 'pending'}`}>{t.status}</span></td>
                  </tr>
                ))}
              {myDeposits.length === 0 && myCashouts.length === 0 && (
                <tr><td colSpan={4} style={{ color: 'var(--text-dim)' }}>এখনো কোনো লেনদেন নেই</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
