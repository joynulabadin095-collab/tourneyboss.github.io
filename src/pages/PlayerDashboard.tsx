import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyEntryPayments } from '../data/store'
import type { EntryPayment } from '../types'

export default function PlayerDashboard() {
  const { user } = useAuth()
  const [myEntries, setMyEntries] = useState<EntryPayment[]>([])

  useEffect(() => {
    getMyEntryPayments().then(setMyEntries)
  }, [])

  if (!user) return null

  return (
    <div className="container" style={{ padding: 'var(--space-8) 0' }}>
      <h1>আমার ড্যাশবোর্ড</h1>

      <div className="card" style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '.78rem', textTransform: 'uppercase' }}>ওয়ালেট ব্যালেন্স</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--gold)' }}>
            ৳{user.walletBalance}
          </div>
        </div>
        <Link to="/wallet" className="btn btn-primary">ওয়ালেট ম্যানেজ করো →</Link>
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
