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
      .then(list => setOpenTournaments(list.filter(t => t.status === 'registration').slice(0, 3)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section style={{ padding: 'var(--space-12) 0 var(--space-8)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <span className="pill-badge">
              <span className="dot" />
              টুর্নামেন্ট + ওয়ালেট প্ল্যাটফর্ম&nbsp;·&nbsp;<span className="accent">লাইভ এখন</span>
            </span>
          </div>

          <h1 className="gradient-text" style={{ fontSize: 'var(--text-2xl)', margin: '0 auto var(--space-4)' }}>
            টুর্নামেন্ট হোস্ট করো, খেলো, জিতে নাও
          </h1>

          <p style={{ color: 'var(--text-dim)', maxWidth: 520, margin: '0 auto', fontSize: 'var(--text-base)' }}>
            Entry fee দিয়ে যেকোনো টুর্নামেন্টে জয়েন করো, অথবা নিজের টুর্নামেন্ট হোস্ট করে
            কমিউনিটি বানাও। প্রাইজ সরাসরি জমা হবে তোমার Tourney Boss ওয়ালেটে।
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tournaments" className="btn btn-primary">টুর্নামেন্ট দেখো</Link>
            <Link to="/login" className="btn btn-outline">হোস্ট হও</Link>
          </div>

          <div className="glow-card" style={{ marginTop: 'var(--space-12)', padding: 'var(--space-6)', textAlign: 'left' }}>
            <h3>কীভাবে কাজ করে</h3>
            <ol style={{ color: 'var(--text-dim)', paddingLeft: 18, lineHeight: 1.9, fontSize: 'var(--text-sm)', margin: 0 }}>
              <li>পছন্দমতো টুর্নামেন্ট বেছে নাও</li>
              <li>bKash/Bank এ entry fee পাঠাও, রেফারেন্স জমা দাও</li>
              <li>Admin verify করলেই স্লট কনফার্ম</li>
              <li>জিতলে প্রাইজ সরাসরি ওয়ালেটে</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: 'var(--space-12) 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-6)' }}>
          <h2>এখন চলছে যেসব টুর্নামেন্ট</h2>
          <Link to="/tournaments" style={{ fontSize: 'var(--text-sm)' }}>সব দেখো →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          {loading && <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>লোড হচ্ছে...</p>}
          {!loading && openTournaments.length === 0 && (
            <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>এখনো কোনো টুর্নামেন্ট খোলা নেই।</p>
          )}
          {openTournaments.map(t => <TournamentCard key={t.id} t={t} />)}
        </div>
      </section>
    </div>
  )
}
