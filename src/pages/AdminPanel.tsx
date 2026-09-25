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

type Tab = 'deposits' | 'entries' | 'organizer' | 'hosting' | 'cashouts'

function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

function ReqActions({ onApprove, onReject }: { onApprove: () => void; onReject: () => void }) {
  return (
    <div className="req-actions">
      <button className="btn btn-primary" onClick={onApprove}>✓ Approve</button>
      <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={onReject}>✕ Reject</button>
    </div>
  )
}

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

  const totalPending = deposits.length + entries.length + hosting.length + cashouts.length + organizerReqs.length

  const STATS: { key: Tab; ico: string; label: string; count: number }[] = [
    { key: 'deposits', ico: '💰', label: 'Deposits', count: deposits.length },
    { key: 'entries', ico: '🎮', label: 'Entry Fee', count: entries.length },
    { key: 'organizer', ico: '🏆', label: 'Host Req.', count: organizerReqs.length },
    { key: 'hosting', ico: '📢', label: 'Hosting Fee', count: hosting.length },
    { key: 'cashouts', ico: '💸', label: 'Withdraw', count: cashouts.length },
  ]

  return (
    <div className="container" style={{ padding: 'var(--space-8) 0', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <span className="pill-badge"><span className="dot" />{totalPending} Pending</span>
      </div>

      <div className="admin-stats">
        {STATS.map(s => (
          <div key={s.key} className={`admin-stat${tab === s.key ? ' active' : ''}`} onClick={() => setTab(s.key)}>
            <div className="ico">{s.ico}</div>
            <div className="num">{s.count}</div>
            <div className="lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {tab === 'deposits' && (
        <div>
          {deposits.map(d => (
            <div key={d.id} className="req-card">
              <div className="req-row">
                <div className="req-who">
                  <div className="req-avatar">{initials(d.playerName)}</div>
                  <div><div className="req-name">{d.playerName}</div><div className="req-sub">{d.method} Deposit</div></div>
                </div>
                <div className="req-amt">৳{d.amount}</div>
              </div>
              <div className="req-ref">Ref: {d.transactionRef}</div>
              <ReqActions onApprove={() => approveDeposit(d.id).then(loadAll)} onReject={() => rejectDeposit(d.id).then(loadAll)} />
            </div>
          ))}
          {deposits.length === 0 && <div className="req-empty">🎉 আর কিছু pending নেই</div>}
        </div>
      )}

      {tab === 'entries' && (
        <div>
          {entries.map(p => (
            <div key={p.id} className="req-card">
              <div className="req-row">
                <div className="req-who">
                  <div className="req-avatar">{initials(p.playerName)}</div>
                  <div><div className="req-name">{p.playerName}</div><div className="req-sub">{p.tournamentId}</div></div>
                </div>
                <div className="req-amt">৳{p.amount}</div>
              </div>
              <span className="badge badge-approved">{p.method}</span>
              <div className="req-ref">Ref: {p.transactionRef}</div>
              <ReqActions onApprove={() => approveEntryPayment(p.id).then(loadAll)} onReject={() => rejectEntryPayment(p.id).then(loadAll)} />
            </div>
          ))}
          {entries.length === 0 && <div className="req-empty">🎉 আর কিছু pending নেই</div>}
        </div>
      )}

      {tab === 'organizer' && (
        <div>
          {organizerReqs.map(r => (
            <div key={r.id} className="req-card">
              <div className="req-row">
                <div className="req-who">
                  <div className="req-avatar">{initials(r.userName)}</div>
                  <div><div className="req-name">{r.userName}</div><div className="req-sub">{r.tournamentName} · {r.game} · {r.teamCount} টিম</div></div>
                </div>
                <div className="req-amt">৳{r.entryFee}</div>
              </div>
              <ReqActions onApprove={() => approveOrganizerRequest(r.id).then(loadAll)} onReject={() => rejectOrganizerRequest(r.id).then(loadAll)} />
            </div>
          ))}
          {organizerReqs.length === 0 && <div className="req-empty">🎉 আর কিছু pending নেই</div>}
          <p style={{ color: 'var(--text-dim)', fontSize: '.8rem', marginTop: 10 }}>
            Approve করলে সাথে সাথে টুর্নামেন্ট তৈরি হয়ে যাবে এবং ইউজার Organizer হয়ে যাবে।
          </p>
        </div>
      )}

      {tab === 'hosting' && (
        <div>
          {hosting.map(r => (
            <div key={r.id} className="req-card">
              <div className="req-row">
                <div className="req-who">
                  <div className="req-avatar">{initials(r.organizerName)}</div>
                  <div><div className="req-name">{r.organizerName}</div><div className="req-sub">{r.tournamentName}</div></div>
                </div>
                <div className="req-amt">৳{r.hostingFee}</div>
              </div>
              <span className="badge badge-approved">{r.method}</span>
              <div className="req-ref">Ref: {r.transactionRef}</div>
              <ReqActions onApprove={() => approveHostingRequest(r.id).then(loadAll)} onReject={() => rejectHostingRequest(r.id).then(loadAll)} />
            </div>
          ))}
          {hosting.length === 0 && <div className="req-empty">🎉 আর কিছু pending নেই</div>}
        </div>
      )}

      {tab === 'cashouts' && (
        <div>
          {cashouts.map(c => (
            <div key={c.id} className="req-card">
              <div className="req-row">
                <div className="req-who">
                  <div className="req-avatar">{initials(c.playerName)}</div>
                  <div><div className="req-name">{c.playerName}</div><div className="req-sub">{c.method} · {c.accountNumber}</div></div>
                </div>
                <div className="req-amt">৳{c.receivableAmount}</div>
              </div>
              <div className="req-ref">অনুরোধ: ৳{c.amount} (ফি বাদে ৳{c.receivableAmount} পাঠাতে হবে)</div>
              <ReqActions onApprove={() => approveCashout(c.id).then(loadAll)} onReject={() => rejectCashout(c.id).then(loadAll)} />
            </div>
          ))}
          {cashouts.length === 0 && <div className="req-empty">🎉 আর কিছু pending নেই</div>}
        </div>
      )}

      <details className="admin-settings">
        <summary>⚙️ Website Settings</summary>
        <p style={{ color: 'var(--text-dim)', fontSize: '.85rem', marginTop: 10 }}>
          App এর জন্য — ডোমেইন বদলালে শুধু এখানে আপডেট করো।
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          <input
            style={{ flex: 1, minWidth: 200 }}
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="https://tourneybosss.netlify.app"
          />
          <button className="btn btn-primary" onClick={saveWebsiteUrl} disabled={savingUrl || baseUrl === savedUrl}>
            {savingUrl ? 'সেভ হচ্ছে...' : 'সেভ করো'}
          </button>
        </div>
        {urlMsg && <p style={{ marginTop: 8, fontSize: '.85rem' }}>{urlMsg}</p>}
      </details>
    </div>
  )
}
