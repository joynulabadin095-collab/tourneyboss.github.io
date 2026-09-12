import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTournaments } from '../data/store'
import TournamentCard from '../components/TournamentCard'
import type { Tournament } from '../types'

export default function Home() {
  const [openTournaments, setOpenTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTournaments()
      .then(list => setOpenTournaments(list.filter(t => t.status === 'open').slice(0, 3)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section style={{ padding: '72px 0 56px', borderBottom: '1px solid var(--border)' }}>
        <div className="container hero-grid">
          <div>
            <h1 style={{ fontSize: '2.6rem', maxWidth: 480 }}>
              টুর্নামেন্ট হোস্ট করো, খেলো, <span style={{ color: 'var(--gold)' }}>জিতে নাও</span>
            </h1>
            <p style={{ color: 'var(--text-dim)', maxWidth: 440, fontSize: '1.05rem' }}>
              Entry fee দিয়ে যেকোনো টুর্নামেন্টে জয়েন করো, অথবা নিজের টুর্নামেন্ট হোস্ট করে
              কমিউনিটি বানাও। প্রাইজ সরাসরি জমা হবে তোমার Tourney Boss ওয়ালেটে।
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Link to="/tournaments" className="btn btn-primary">টুর্নামেন্ট দেখো</Link>
              <Link to="/login" className="btn btn-outline">হোস্ট হও</Link>
            </div>
          </div>
          <div className="card">
            <h3>কীভাবে কাজ করে</h3>
            <ol style={{ color: 'var(--text-dim)', paddingLeft: 18, lineHeight: 1.9 }}>
              <li>পছন্দমতো টুর্নামেন্ট বেছে নাও</li>
              <li>bKash/Bank এ entry fee পাঠাও, রেফারেন্স জমা দাও</li>
              <li>Admin verify করলেই স্লট কনফার্ম</li>
              <li>জিতলে প্রাইজ সরাসরি ওয়ালেটে</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '48px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
          <h2>এখন চলছে যেসব টুর্নামেন্ট</h2>
          <Link to="/tournaments">সব দেখো →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {loading && <p style={{ color: 'var(--text-dim)' }}>লোড হচ্ছে...</p>}
          {!loading && openTournaments.length === 0 && (
            <p style={{ color: 'var(--text-dim)' }}>এখনো কোনো টুর্নামেন্ট খোলা নেই।</p>
          )}
          {openTournaments.map(t => <TournamentCard key={t.id} t={t} />)}
        </div>
      </section>
    </div>
  )
    }
