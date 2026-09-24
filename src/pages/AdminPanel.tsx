import { useEffect, useState } from 'react'
import {
  getPendingEntryPayments, approveEntryPayment, rejectEntryPayment,
  getPendingHostingRequests, approveHostingRequest, rejectHostingRequest,
  getPendingCashouts, approveCashout, rejectCashout,
  getPendingDeposits, approveDeposit, rejectDeposit,
  getPendingOrganizerRequests, approveOrganizerRequest, rejectOrganizerRequest,
  getWebsiteConfig, updateWebsiteConfig,
} from '../data/store'
import type { EntryPayment, HostingRequest, CashoutRequest, Deposit, OrganizerRequest } from '../types'

type Tab = 'deposits' | 'entries' | 'hosting' | 'cashouts' | 'organizer'

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
  const [urlMsg, setUrlMsg] = useState('')

  useEffect(() => {
    loadAll()
    getWebsiteConfig().then(c => { setBaseUrl(c.baseUrl); setSavedUrl(c.baseUrl) })
  }, [])

  function loadAll() {
    getPendingDeposits().then(setDeposits)
    getPendingEntryPayments().then(setEntries)
    getPendingHostingRequests().then(setHosting)
    getPendingCashouts().then(setCashouts)
    getPendingOrganizerRequests().then(setOrganizerReqs)
  }

  async function approveDep(id: string) { await approveDeposit(id); loadAll() }
  async function rejectDep(id: string) { await rejectDeposit(id); loadAll() }
  async function approveEntry(id: string) { await approveEntryPayment(id); loadAll() }
  async function rejectEntry(id: string) { await rejectEntryPayment(id); loadAll() }
  async function approveHosting(id: string) { await approveHostingRequest(id); loadAll() }
  async function rejectHosting(id: string) { await rejectHostingRequest(id); loadAll() }
  async function approveCashoutReq(id: string) { await approveCashout(id); loadAll() }
  async function rejectCashoutReq(id: string) { await rejectCashout(id); loadAll() }
  async function approveOrgReq(id: string) { await approveOrganizerRequest(id); loadAll() }
  async function rejectOrgReq(id: string) { await rejectOrganizerRequest(id); loadAll() }

  async function saveWebsiteUrl() {
    setUrlMsg('')
    setSavingUrl(true)
    try {
      const r = await updateWebsiteConfig(baseUrl)
      setSavedUrl(r.baseUrl)
      setUrlMsg('সেভ হয়েছে ✅')
    } catch (err) {
      setUrlMsg(err instanceof Error ? err.message : 'সেভ করা যায়নি')
    } finally {
      setSavingUrl(false)
    }
  }

  return (
    <div className="container" style={{ padding: 'var(--space-8) 0' }}>
      <h1>Admin প্যানেল</h1>

      {/* Website URL — the app reads this instead of a hardcoded domain */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginTop: 0 }}>Website URL (App এর জন্য)</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '.88rem' }}>
          ডোমেইন বদলালে শুধু এখানে আপডেট করো — App কোনো hardcoded URL ব্যবহার করে না, এখান থেকেই পড়ে।
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            style={{ flex: 1, minWidth: 220 }}
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="https://tourneybosss.netlify.app"
          />
          <button className="btn btn-primary" onClick={saveWebsiteUrl} disabled={savingUrl || baseUrl === savedUrl}>
            {savingUrl ? 'সেভ হচ্ছে...' : 'সেভ করো'}
          </button>
        </div>
        {urlMsg && <p style={{ marginTop: 8, fontSize: '.85rem' }}>{urlMsg}</p>}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', margin: 'var(--space-6) 0', flexWrap: 'wrap' }}>
        <button className={tab === 'deposits' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('deposits')}>
          Deposits ({deposits.length})
        </button>
        <button className={tab === 'entries' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('entries')}>
          Entry Fee ({entries.length})
        </button>
        <button className={tab === 'organizer' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('organizer')}>
          Host Requests ({organizerReqs.length})
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

      {tab === 'organizer' && (
        <div className="card">
          <div className="table-wrap">
          <table className="table">
            <thead><tr><th>User</th><th>টুর্নামেন্ট</th><th>গেম</th><th>টিম</th><th>Entry Fee</th><th></th></tr></thead>
            <tbody>
              {organizerReqs.map(r => (
                <tr key={r.id}>
                  <td>{r.userName}</td><td>{r.tournamentName}</td><td>{r.game}</td>
                  <td>{r.teamCount}</td><td>৳{r.entryFee}</td>
                  <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-primary" onClick={() => approveOrgReq(r.id)}>Approve</button>
                    <button className="btn btn-danger" onClick={() => rejectOrgReq(r.id)}>Reject</button>
                  </td>
                </tr>
              ))}
              {organizerReqs.length === 0 && <tr><td colSpan={6} style={{ color: 'var(--text-dim)' }}>Pending কিছু নেই</td></tr>}
            </tbody>
          </table>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '.82rem', marginTop: 10 }}>
            Approve করলে সাথে সাথে টুর্নামেন্ট তৈরি হয়ে যাবে (isPaid + entryFee সহ) এবং ইউজার Organizer হয়ে যাবে।
          </p>
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
