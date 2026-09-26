import { useEffect, useRef, useState } from 'react'
import {
  getPendingEntryPayments, approveEntryPayment, rejectEntryPayment,
  getPendingHostingRequests, approveHostingRequest, rejectHostingRequest,
  getPendingCashouts, approveCashout, rejectCashout,
  getPendingDeposits, approveDeposit, rejectDeposit,
  getPendingOrganizerRequests, approveOrganizerRequest, rejectOrganizerRequest,
  getWebsiteConfig, updateWebsiteConfig,
} from '../data/store'
import type { EntryPayment, HostingRequest, CashoutRequest, Deposit, OrganizerRequest } from '../types'

type Tab = 'deposits' | 'entries' | 'organizer' | 'hosting' | 'cashouts'
type Toast = { id: number; type: 'success' | 'danger'; title: string; msg: string }

function timeAgo(iso: string) {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (diffSec < 60) return `${diffSec}s ago`
  const min = Math.floor(diffSec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

let toastId = 0

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('deposits')
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [entries, setEntries] = useState<EntryPayment[]>([])
  const [hosting, setHosting] = useState<HostingRequest[]>([])
  const [cashouts, setCashouts] = useState<CashoutRequest[]>([])
  const [organizerReqs, setOrganizerReqs] = useState<OrganizerRequest[]>([])

  const [baseUrl, setBaseUrl] = useState('')
  const [savedUrl, setSavedUrl] = useState('')
  const [savingUrl, setSavingUrl] = useState(false)

  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    loadAll()
    getWebsiteConfig().then(c => { setBaseUrl(c.baseUrl); setSavedUrl(c.baseUrl) })
    return () => timers.current.forEach(clearTimeout)
  }, [])

  function loadAll() {
    getPendingDeposits().then(setDeposits)
    getPendingEntryPayments().then(setEntries)
    getPendingHostingRequests().then(setHosting)
    getPendingCashouts().then(setCashouts)
    getPendingOrganizerRequests().then(setOrganizerReqs)
  }

  function pushToast(type: Toast['type'], title: string, msg: string) {
    const id = ++toastId
    setToasts(t => [...t, { id, type, title, msg }])
    timers.current.push(setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000))
  }

  async function saveUrl() {
    setSavingUrl(true)
    try {
      const r = await updateWebsiteConfig(baseUrl)
      setSavedUrl(r.baseUrl)
      pushToast('success', 'সেভ হয়েছে!', '')
    } catch (err) {
      pushToast('danger', 'সেভ করা যায়নি', err instanceof Error ? err.message : '')
    } finally {
      setSavingUrl(false)
    }
  }

  async function doApprove(fn: () => Promise<unknown>, name: string, extra: string) {
    try {
      await fn()
      pushToast('success', `${name} — Approved!`, extra)
      loadAll()
    } catch (err) {
      pushToast('danger', 'ব্যর্থ হয়েছে', err instanceof Error ? err.message : '')
    }
  }
  async function doReject(fn: () => Promise<unknown>, name: string) {
    try {
      await fn()
      pushToast('danger', `${name} — Rejected`, 'Request declined')
      loadAll()
    } catch (err) {
      pushToast('danger', 'ব্যর্থ হয়েছে', err instanceof Error ? err.message : '')
    }
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'deposits', label: '💰 Deposits', count: deposits.length },
    { key: 'entries', label: '🎮 Entry Fee', count: entries.length },
    { key: 'organizer', label: '🏆 Host Requests', count: organizerReqs.length },
    { key: 'hosting', label: '💸 Hosting Fee', count: hosting.length },
    { key: 'cashouts', label: '💳 Withdraw', count: cashouts.length },
  ]

  return (
    <div className="container" style={{ padding: 'var(--space-8) 0' }}>
      <h1>Admin প্যানেল</h1>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginTop: 0 }}>🌐 Website URL (App এর জন্য)</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '.88rem' }}>
          ডোমেইন বদলালে শুধু এখানে আপডেট করো — App কোনো hardcoded URL ব্যবহার করে না।
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <input style={{ flex: 1, minWidth: 200 }} value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://..." />
          <button className="btn btn-primary" onClick={saveUrl} disabled={savingUrl || baseUrl === savedUrl}>
            {savingUrl ? 'সেভ হচ্ছে...' : 'সেভ করো'}
          </button>
        </div>
      </div>

      <div className="tab-row">
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === 'deposits' && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Deposits</h3>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Player</th><th>পরিমাণ</th><th>মাধ্যম</th><th>TrxID</th><th>সময়</th><th></th></tr></thead>
              <tbody>
                {deposits.map(d => (
                  <tr key={d.id}>
                    <td>{d.playerName}</td>
                    <td><strong style={{ color: 'var(--gold)' }}>৳{d.amount}</strong></td>
                    <td>{d.method}</td>
                    <td><span className="mono">{d.transactionRef}</span></td>
                    <td className="time-ago">{timeAgo(d.createdAt)}</td>
                    <td style={{ whiteSpace: 'nowrap', display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '.78rem' }}
                        onClick={() => doApprove(() => approveDeposit(d.id), d.playerName, 'Wallet credited')}>✓ Approve</button>
                      <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '.78rem' }}
                        onClick={() => doReject(() => rejectDeposit(d.id), d.playerName)}>✕ Reject</button>
                    </td>
                  </tr>
                ))}
                {deposits.length === 0 && <tr><td colSpan={6} style={{ color: 'var(--text-dim)' }}>Pending কিছু নেই</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'entries' && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Entry Fee</h3>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Player</th><th>টুর্নামেন্ট</th><th>পরিমাণ</th><th>মাধ্যম</th><th>TrxID</th><th>সময়</th><th></th></tr></thead>
              <tbody>
                {entries.map(p => (
                  <tr key={p.id}>
                    <td>{p.playerName}</td>
                    <td>{p.tournamentId}</td>
                    <td><strong style={{ color: 'var(--gold)' }}>৳{p.amount}</strong></td>
                    <td>{p.method}</td>
                    <td><span className="mono">{p.transactionRef}</span></td>
                    <td className="time-ago">{timeAgo(p.createdAt)}</td>
                    <td style={{ whiteSpace: 'nowrap', display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '.78rem' }}
                        onClick={() => doApprove(() => approveEntryPayment(p.id), p.playerName, 'Entry confirmed')}>✓ Approve</button>
                      <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '.78rem' }}
                        onClick={() => doReject(() => rejectEntryPayment(p.id), p.playerName)}>✕ Reject</button>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && <tr><td colSpan={7} style={{ color: 'var(--text-dim)' }}>Pending কিছু নেই</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'organizer' && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Host Requests</h3>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>User</th><th>টুর্নামেন্ট</th><th>গেম</th><th>টিম</th><th>Entry Fee</th><th></th></tr></thead>
              <tbody>
                {organizerReqs.map(r => (
                  <tr key={r.id}>
                    <td>{r.userName}</td>
                    <td>{r.tournamentName}</td>
                    <td>{r.game}</td>
                    <td>{r.teamCount}</td>
                    <td><strong style={{ color: 'var(--gold)' }}>৳{r.entryFee}</strong></td>
                    <td style={{ whiteSpace: 'nowrap', display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '.78rem' }}
                        onClick={() => doApprove(() => approveOrganizerRequest(r.id), r.userName, 'Tournament created')}>✓ Approve</button>
                      <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '.78rem' }}
                        onClick={() => doReject(() => rejectOrganizerRequest(r.id), r.userName)}>✕ Reject</button>
                    </td>
                  </tr>
                ))}
                {organizerReqs.length === 0 && <tr><td colSpan={6} style={{ color: 'var(--text-dim)' }}>Pending কিছু নেই</td></tr>}
              </tbody>
            </table>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '.82rem', marginTop: 10 }}>
            Approve করলে সাথে সাথে টুর্নামেন্ট তৈরি হয়ে যাবে এবং ইউজার Organizer হয়ে যাবে।
          </p>
        </div>
      )}

      {tab === 'hosting' && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Hosting Fee</h3>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Organizer</th><th>টুর্নামেন্ট</th><th>ফি</th><th>মাধ্যম</th><th>TrxID</th><th>সময়</th><th></th></tr></thead>
              <tbody>
                {hosting.map(r => (
                  <tr key={r.id}>
                    <td>{r.organizerName}</td>
                    <td>{r.tournamentName}</td>
                    <td><strong style={{ color: 'var(--gold)' }}>৳{r.hostingFee}</strong></td>
                    <td>{r.method}</td>
                    <td><span className="mono">{r.transactionRef}</span></td>
                    <td className="time-ago">{timeAgo(r.createdAt)}</td>
                    <td style={{ whiteSpace: 'nowrap', display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '.78rem' }}
                        onClick={() => doApprove(() => approveHostingRequest(r.id), r.organizerName, '')}>✓ Approve</button>
                      <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '.78rem' }}
                        onClick={() => doReject(() => rejectHostingRequest(r.id), r.organizerName)}>✕ Reject</button>
                    </td>
                  </tr>
                ))}
                {hosting.length === 0 && <tr><td colSpan={7} style={{ color: 'var(--text-dim)' }}>Pending কিছু নেই</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'cashouts' && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Withdraw Requests</h3>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Player</th><th>পরিমাণ</th><th>পাঠাতে হবে</th><th>মাধ্যম</th><th>Account</th><th>সময়</th><th></th></tr></thead>
              <tbody>
                {cashouts.map(c => (
                  <tr key={c.id}>
                    <td>{c.playerName}</td>
                    <td><strong style={{ color: 'var(--danger)' }}>৳{c.amount}</strong></td>
                    <td><strong style={{ color: 'var(--gold)' }}>৳{c.receivableAmount}</strong></td>
                    <td>{c.method}</td>
                    <td>{c.accountNumber}</td>
                    <td className="time-ago">{timeAgo(c.createdAt)}</td>
                    <td style={{ whiteSpace: 'nowrap', display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '.78rem' }}
                        onClick={() => doApprove(() => approveCashout(c.id), c.playerName, 'টাকা পাঠিয়ে দাও')}>✓ Approve</button>
                      <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '.78rem' }}
                        onClick={() => doReject(() => rejectCashout(c.id), c.playerName)}>✕ Reject</button>
                    </td>
                  </tr>
                ))}
                {cashouts.length === 0 && <tr><td colSpan={7} style={{ color: 'var(--text-dim)' }}>Pending কিছু নেই</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast${t.type === 'danger' ? ' danger' : ''}`}>
            <div className="t-title">{t.title}</div>
            {t.msg && <div className="t-msg">{t.msg}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
