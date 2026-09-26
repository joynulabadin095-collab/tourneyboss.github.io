import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyDeposits, submitDeposit, getMyCashouts, submitCashout } from '../data/store'
import type { Deposit, CashoutRequest, PaymentMethod } from '../types'
import { PLATFORM_FEE_RATE } from '../types'
import { ADMIN_PAYMENT_NUMBERS } from '../config'

type MobileMethod = Exclude<PaymentMethod, 'Bank'>
type Tab = 'deposit' | 'withdraw'

const MIN_DEPOSIT = 20
const QUICK_AMOUNTS = [50, 100, 200, 500]

function feePreview(amount: string) {
  const amt = Number(amount)
  if (!amt || amt <= 0) return null
  const fee = Math.round(amt * PLATFORM_FEE_RATE * 100) / 100
  return { amt, fee, net: Math.round((amt - fee) * 100) / 100 }
}

function FeeBox({ preview, creditLabel }: { preview: { amt: number; fee: number; net: number }; creditLabel: string }) {
  return (
    <div className="card" style={{ background: 'var(--surface-2)', padding: 14, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', marginBottom: 8 }}>
        <span style={{ color: 'var(--text-dim)' }}>পরিমাণ</span><span>৳{preview.amt}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', marginBottom: 8 }}>
        <span style={{ color: 'var(--text-dim)' }}>সার্ভিস ফি (2%)</span><span style={{ color: 'var(--danger)' }}>- ৳{preview.fee}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', fontWeight: 700 }}>
        <span>{creditLabel}</span><span style={{ color: 'var(--success)' }}>৳{preview.net}</span>
      </div>
    </div>
  )
}

export default function Wallet() {
  const { user, refresh } = useAuth()
  const [tab, setTab] = useState<Tab>('deposit')
  const [copied, setCopied] = useState(false)

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

  function copyAdminNumber() {
    navigator.clipboard?.writeText(ADMIN_PAYMENT_NUMBERS[depMethod])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function requestDeposit(e: FormEvent) {
    e.preventDefault()
    setDepError('')
    setDepSuccess(false)
    const amt = Number(depAmount)
    if (!amt || amt < MIN_DEPOSIT) { setDepError(`সর্বনিম্ন ৳${MIN_DEPOSIT} deposit করা যাবে`); return }
    if (!depTrxId.trim()) return
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
    if (!amt || amt > user.walletBalance) { setError('সঠিক amount দাও'); return }
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
          <h3 style={{ marginTop: 0 }}>Deposit Funds</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '.85rem', marginTop: -6 }}>Add balance to your wallet</p>

          <form onSubmit={requestDeposit}>
            <label style={{ fontSize: '.85rem', fontWeight: 600 }}>১. Payment Method বেছে নাও</label>
            <div style={{ display: 'flex', gap: 8, margin: '8px 0 14px' }}>
              {(['bKash', 'Nagad', 'Rocket'] as MobileMethod[]).map(m => (
                <button
                  key={m} type="button"
                  className={depMethod === m ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{ flex: 1, padding: '8px 4px', fontSize: '.85rem' }}
                  onClick={() => setDepMethod(m)}
                >{m}</button>
              ))}
            </div>

            <div className="card" style={{ background: 'var(--surface-2)', padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: '.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Admin {depMethod} নাম্বার</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <strong style={{ fontSize: '1.1rem' }}>{ADMIN_PAYMENT_NUMBERS[depMethod]}</strong>
                <button type="button" className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '.8rem' }} onClick={copyAdminNumber}>
                  {copied ? '✓ কপি হয়েছে' : '📋 Copy'}
                </button>
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '.78rem', margin: '6px 0 0' }}>
                এই নাম্বারে Send Money করো, তারপর নিচে Transaction ID বসাও।
              </p>
            </div>

            <label style={{ fontSize: '.85rem', fontWeight: 600 }}>২. Deposit Amount (৳)</label>
            <span style={{ float: 'right', color: 'var(--text-dim)', fontSize: '.78rem' }}>Min ৳{MIN_DEPOSIT}</span>
            <div className="field" style={{ marginTop: 6 }}>
              <input type="number" min={MIN_DEPOSIT} value={depAmount} onChange={e => setDepAmount(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {QUICK_AMOUNTS.map(a => (
                <button key={a} type="button" className="btn btn-outline" style={{ flex: 1, padding: '7px 4px', fontSize: '.8rem' }}
                  onClick={() => setDepAmount(String(a))}>৳{a}</button>
              ))}
            </div>

            {depositPreview && <FeeBox preview={depositPreview} creditLabel="Wallet Credit" />}

            <label style={{ fontSize: '.85rem', fontWeight: 600 }}>৩. Transaction ID (TrxID)</label>
            <div className="field" style={{ marginTop: 6 }}>
              <input value={depTrxId} onChange={e => setDepTrxId(e.target.value)} placeholder="যেমন 9J83KL921" required />
            </div>

            {depError && <p style={{ color: 'var(--danger)' }}>{depError}</p>}
            {depSuccess && <p style={{ color: 'var(--gold)' }}>সাবমিট হয়েছে — Admin ভেরিফাই করার পর ব্যালেন্স যোগ হবে</p>}
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              Submit Deposit Request {depAmount ? `(৳${depAmount})` : ''}
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ marginTop: 0 }}>Withdraw Winnings</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '.85rem', marginTop: -6 }}>Payout to your personal mobile wallet</p>

          <div className="card" style={{ background: 'var(--surface-2)', padding: 14, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)' }}>Available Balance</span>
            <strong>৳{user.walletBalance}</strong>
          </div>

          <form onSubmit={requestCashout}>
            <label style={{ fontSize: '.85rem', fontWeight: 600 }}>১. Payout Method</label>
            <div style={{ display: 'flex', gap: 8, margin: '8px 0 14px' }}>
              {(['bKash', 'Nagad', 'Rocket'] as MobileMethod[]).map(m => (
                <button
                  key={m} type="button"
                  className={method === m ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{ flex: 1, padding: '8px 4px', fontSize: '.85rem' }}
                  onClick={() => setMethod(m)}
                >{m}</button>
              ))}
            </div>

            <label style={{ fontSize: '.85rem', fontWeight: 600 }}>২. তোমার {method} নাম্বার</label>
            <div className="field" style={{ marginTop: 6 }}>
              <input value={account} onChange={e => setAccount(e.target.value)} placeholder="01XXXXXXXXX" required />
            </div>

            <label style={{ fontSize: '.85rem', fontWeight: 600 }}>৩. Withdrawal Amount (৳)</label>
            <span
              style={{ float: 'right', color: 'var(--gold)', fontSize: '.78rem', cursor: 'pointer' }}
              onClick={() => setAmount(String(user.walletBalance))}
            >
              Withdraw All
            </span>
            <div className="field" style={{ marginTop: 6 }}>
              <input type="number" min={1} max={user.walletBalance} value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>

            {withdrawPreview && <FeeBox preview={withdrawPreview} creditLabel="Final Receiving Amount" />}

            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              Request Payout {withdrawPreview ? `(Receive ৳${withdrawPreview.net})` : ''}
            </button>
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
