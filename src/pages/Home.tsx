import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getTournaments } from '../data/store'
import { useAuth } from '../context/AuthContext'
import { useReveal } from '../hooks/useReveal'
import TournamentCard from '../components/TournamentCard'
import type { Tournament } from '../types'

const SOCIAL_LINKS = [
  { label: '📘', title: 'Facebook', href: 'https://www.facebook.com/share/19iq3hcLsy/' },
  { label: '▶️', title: 'YouTube', href: 'https://youtube.com/@dragonversegaming?si=gfTuFdNhrrshMq1Q' },
  { label: '🎮', title: 'Discord', href: 'https://discord.gg/YdfcnhS5mJ' },
  { label: '✈️', title: 'Telegram', href: 'https://t.me/tournyboss' },
]

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tourneyboss.player'
const FEEDBACK_GROUP_URL = 'https://t.me/+Am1ZHsNwysgzNzU1'

function Reveal({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const { ref, className } = useReveal<HTMLDivElement>()
  return <div ref={ref} className={className} style={style}>{children}</div>
}

export default function Home() {
  const [openTournaments, setOpenTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const { continueWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getTournaments()
      .then(list => setOpenTournaments(list.filter(t => t.status === 'registration')))
      .finally(() => setLoading(false))
  }, [])

  async function handleGoogleStart() {
    try {
      await continueWithGoogle()
    } catch {
      // Any error (popup closed, blocked, etc.) surfaces on the login page.
    }
    navigate('/login')
  }

  const featured = openTournaments[0]
  const featuredSlotsLeft = featured ? featured.teamCount - featured.registeredTeams : 0
  const featuredFillPct = featured && featured.teamCount > 0
    ? Math.min(100, Math.round((featured.registeredTeams / featured.teamCount) * 100))
    : 0
  const featuredPrize = featured ? (featured.championPrize || featured.prizeDescription || 'Custom Prizes') : null

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="container hero-grid">
          <Reveal>
            <span className="pill-badge" style={{ marginBottom: 20 }}>
              <span className="dot" />
              টুর্নামেন্ট + ওয়ালেট প্ল্যাটফর্ম&nbsp;·&nbsp;<span className="accent">লাইভ এখন</span>
            </span>
            <h1>
              টুর্নামেন্ট <span className="gradient">হোস্ট করো,</span><br />
              খেলো, জিতে নাও।
            </h1>
            <p className="hero-sub">
              Entry fee দিয়ে যেকোনো টুর্নামেন্টে জয়েন করো, অথবা নিজের টুর্নামেন্ট হোস্ট করে
              কমিউনিটি বানাও।
            </p>
          </Reveal>

          <Reveal>
            {/* Real data — first open tournament, or a friendly empty state */}
            <div className="live-card">
              {featured ? (
                <>
                  <div className="live-card-head">
                    <span className="live-badge"><span className="pulse" /> রেজিস্ট্রেশন চলছে</span>
                    <span className="live-card-game">{featured.game}</span>
                  </div>
                  <h3 className="live-card-title">{featured.name}</h3>
                  <p className="live-card-meta">{featured.gameMode}</p>

                  <div className="prize-row">
                    <div className="prize-block">
                      <span className="label">প্রাইজ</span>
                      <div className="value">{featuredPrize}</div>
                    </div>
                  </div>

                  <div className="slots">
                    <div className="slots-head">
                      <span className="filled"><strong>{featured.registeredTeams}</strong>/{featured.teamCount} টিম যুক্ত হয়েছে</span>
                      <span>{featuredSlotsLeft} স্লট বাকি</span>
                    </div>
                    <div className="progress"><div className="progress-fill" style={{ width: `${featuredFillPct}%` }} /></div>
                  </div>

                  <div className="live-card-cta">
                    <Link to={`/tournaments/${featured.id}`} className="btn btn-primary">এখনই জয়েন করো</Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="live-card-head">
                    <span className="live-badge" style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}>শীঘ্রই</span>
                  </div>
                  <h3 className="live-card-title">এখনো কোনো টুর্নামেন্ট খোলা নেই</h3>
                  <p className="live-card-meta">
                    টুর্নামেন্ট হোস্ট করা যায় শুধু Tourney Boss অ্যাপ থেকে — ওয়েবসাইটে না।
                  </p>
                  <div className="live-card-cta">
                    <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className="btn btn-primary">
                      📱 অ্যাপ ডাউনলোড করে হোস্ট করো
                    </a>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="section" id="how">
        <div className="container">
          <Reveal style={{ textAlign: 'center' }}>
            <span className="pill-badge" style={{ marginBottom: 18 }}><span className="dot" /> কীভাবে কাজ করে</span>
            <h2 className="section-title">চারটা সহজ স্টেপে শুরু</h2>
            <p className="section-sub">bKash/Bank এ ফি দাও, স্লট নিশ্চিত করো, খেলো, জিতলে প্রাইজ ওয়ালেটে।</p>
          </Reveal>

          <Reveal>
            <div className="flow">
              <div className="flow-step">
                <div className="flow-num">১</div>
                <h3>টুর্নামেন্ট বেছে নাও</h3>
                <p>গেম, ফরম্যাট আর প্রাইজ দেখে যেটা সুইট করে সেটাতে ক্লিক করো।</p>
              </div>
              <div className="flow-step">
                <div className="flow-num">২</div>
                <h3>Entry fee পাঠাও</h3>
                <p>bKash বা Bank এ পেমেন্ট করে রেফারেন্স জমা দাও।</p>
              </div>
              <div className="flow-step">
                <div className="flow-num">৩</div>
                <h3>Verify ও স্লট কনফার্ম</h3>
                <p>Admin রেফারেন্স চেক করে স্লট কনফার্ম করে দেয়।</p>
              </div>
              <div className="flow-step">
                <div className="flow-num">৪</div>
                <h3>খেলো, জিতে নাও</h3>
                <p>ম্যাচ শেষে জিতলে প্রাইজ সরাসরি তোমার ওয়ালেটে।</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ LIVE TOURNAMENTS (real data) ============ */}
      <section className="section" id="tournaments">
        <div className="container">
          <Reveal style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
            <div>
              <span className="pill-badge" style={{ marginBottom: 14 }}><span className="dot" /> এখন চলছে</span>
              <h2 className="section-title" style={{ marginBottom: 4 }}>খোলা টুর্নামেন্ট</h2>
              <p className="section-sub" style={{ margin: 0 }}>জয়েন করো এখনই — স্লট দ্রুত ভরে যাচ্ছে।</p>
            </div>
            <Link to="/tournaments" className="btn btn-outline">সব দেখো →</Link>
          </Reveal>

          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
              {loading && <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>লোড হচ্ছে...</p>}
              {!loading && openTournaments.length === 0 && (
                <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>এখনো কোনো টুর্নামেন্ট খোলা নেই।</p>
              )}
              {openTournaments.slice(0, 6).map(t => <TournamentCard key={t.id} t={t} />)}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ WHY HOST ============ */}
      <section className="section" id="host">
        <div className="container">
          <Reveal style={{ textAlign: 'center' }}>
            <span className="pill-badge" style={{ marginBottom: 18 }}><span className="dot" /> হোস্ট বেনিফিট</span>
            <h2 className="section-title">কেন এখানে টুর্নামেন্ট হোস্ট করবে?</h2>
            <p className="section-sub">স্বচ্ছ পেমেন্ট, সরাসরি ওয়ালেটে প্রাইজ, নিজের কমিউনিটি — কোনো হিডেন ফি ছাড়াই।</p>
          </Reveal>

          <Reveal>
            <div className="feature-grid">
              <div className="feature">
                <div className="ico">🔒</div>
                <h3>স্বচ্ছ পেমেন্ট</h3>
                <p>bKash/Bank এ entry fee আসে, Admin নিজে verify করে।</p>
              </div>
              <div className="feature">
                <div className="ico">💰</div>
                <h3>ওয়ালেটে প্রাইজ</h3>
                <p>জেতা টাকা প্লেয়ারের ওয়ালেটে সরাসরি জমা হয়।</p>
              </div>
              <div className="feature">
                <div className="ico">🧑‍🤝‍🧑</div>
                <h3>নিজের কমিউনিটি</h3>
                <p>বারবার হোস্ট করে নিজের প্লেয়ার কমিউনিটি গড়ে তোলার সুযোগ।</p>
              </div>
              <div className="feature">
                <div className="ico">🧾</div>
                <h3>হিডেন ফি নেই</h3>
                <p>শুধু একটা হোস্টিং ফি — এর বাইরে কোনো লুকানো চার্জ নেই।</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ APP vs WEB SPLIT ============ */}
      <section className="section">
        <div className="container">
          <Reveal style={{ textAlign: 'center' }}>
            <span className="pill-badge" style={{ marginBottom: 18 }}><span className="dot" /> দু'টো মিলে একটা</span>
            <h2 className="section-title">অ্যাপ আর ওয়েবসাইট, একসাথে</h2>
            <p className="section-sub">Google Play এর নীতির কারণে পেমেন্ট ওয়েবে, গেমিং অভিজ্ঞতা অ্যাপে।</p>
          </Reveal>

          <Reveal>
            <div className="split-card">
              <div className="split-side web">
                <div className="ico">🌐</div>
                <span className="tag">ওয়েবসাইটে</span>
                <h3>পেমেন্ট ও ওয়ালেট হাব</h3>
                <ul>
                  <li><span className="tick">✓</span> Entry fee জমা দাও (bKash/Bank)</li>
                  <li><span className="tick">✓</span> প্রাইজ ক্যাশ-আউট রিকোয়েস্ট করো</li>
                  <li><span className="tick">✓</span> ওয়ালেট ব্যালেন্স দেখো</li>
                  <li><span className="tick">✓</span> হোস্টিং ফি পেমেন্ট করো</li>
                </ul>
                <Link to="/login" className="btn btn-outline">📲 ওয়েব অ্যাকাউন্ট খোলো</Link>
              </div>
              <div className="split-side app">
                <div className="ico">📱</div>
                <span className="tag">অ্যাপে</span>
                <h3>গেমিং ও কমিউনিটি</h3>
                <ul>
                  <li><span className="tick">✓</span> টিম বানাও ও মেম্বার ইনভাইট করো</li>
                  <li><span className="tick">✓</span> রোস্টার ও ম্যাচ শিডিউল ম্যানেজ করো</li>
                  <li><span className="tick">✓</span> লাইভ চ্যাট ও ম্যাচ আপডেট পাও</li>
                  <li><span className="tick">✓</span> টুর্নামেন্টের পুরো গেমপ্লে অভিজ্ঞতা</li>
                </ul>
                <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className="btn btn-outline">▶️ Play Store থেকে নাও</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="section" id="faq">
        <div className="container">
          <Reveal style={{ textAlign: 'center' }}>
            <span className="pill-badge" style={{ marginBottom: 18 }}><span className="dot" /> FAQ</span>
            <h2 className="section-title">প্রায়ই জিজ্ঞেস করা প্রশ্ন</h2>
          </Reveal>

          <Reveal>
            <div className="faq-list">
              <details className="faq">
                <summary>Entry fee verify হতে কত সময় লাগে? <span className="plus">+</span></summary>
                <div className="answer">সাধারণত Admin কয়েক ঘন্টার মধ্যেই bKash/Bank রেফারেন্স চেক করে স্লট কনফার্ম করে দেয়।</div>
              </details>
              <details className="faq">
                <summary>প্রাইজ জিতলে কীভাবে তুলবো? <span className="plus">+</span></summary>
                <div className="answer">জেতা প্রাইজ প্রথমে তোমার Tourney Boss ওয়ালেটে জমা হয়। এরপর ওয়েবসাইট থেকে ক্যাশ-আউট রিকোয়েস্ট দিলে bKash/Bank এ টাকা আসবে।</div>
              </details>
              <details className="faq">
                <summary>টিম বানাবো কোথা থেকে? <span className="plus">+</span></summary>
                <div className="answer">টিম তৈরি, মেম্বার ইনভাইট, রোস্টার ম্যানেজ, লাইভ চ্যাট আর ম্যাচ শিডিউল — সবকিছু হয় Tourney Boss অ্যাপে। ওয়েবসাইট শুধু পেমেন্ট আর ওয়ালেট সামলায়।</div>
              </details>
              <details className="faq">
                <summary>অ্যাপ না থাকলে কি টুর্নামেন্ট খেলা যাবে? <span className="plus">+</span></summary>
                <div className="answer">পেমেন্ট আর ওয়ালেট ওয়েবসাইটে হলেও, টিম বানানো ও ম্যাচ খেলার পুরো অভিজ্ঞতার জন্য অ্যাপ ইনস্টল করা লাগবে।</div>
              </details>
              <details className="faq">
                <summary>কোন কোন গেম সাপোর্টেড? <span className="plus">+</span></summary>
                <div className="answer">এখন Mobile Legends: Bang Bang, Free Fire, PUBG Mobile সহ আরো বেশ কিছু জনপ্রিয় গেম সাপোর্টেড। চাহিদা অনুযায়ী নতুন গেম যোগ হবে।</div>
              </details>
              <details className="faq">
                <summary>হোস্ট হতে কী কী লাগে? <span className="plus">+</span></summary>
                <div className="answer">একটা Google অ্যাকাউন্ট, একটা ভেরিফাইড bKash/Bank নাম্বার আর হোস্টিং ফি। এরপর Admin panel থেকে টুর্নামেন্টের নিয়ম, স্লট সংখ্যা আর প্রাইজ পুল সেট করে দেওয়া হয়।</div>
              </details>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="cta-banner">
              <span className="pill-badge" style={{ marginBottom: 18 }}><span className="dot" /> শুরু করো এখনই</span>
              <h2>তোমার প্রথম টুর্নামেন্ট এখান থেকে</h2>
              <p>Google অ্যাকাউন্ট দিয়ে এক ক্লিকে শুরু করো — প্লেয়ার হিসেবে খেলো অথবা অর্গানাইজার হিসেবে হোস্ট করো।</p>
              <div className="cta-actions">
                <button className="btn btn-primary" onClick={handleGoogleStart}>⚡ Continue with Google</button>
                <Link to="/tournaments" className="btn btn-outline">🏆 আগে টুর্নামেন্ট দেখো</Link>
              </div>
              <p className="small">কোনো ইনস্টলেশন লাগবে না — ফ্রি অ্যাকাউন্ট, কয়েক সেকেন্ডে শুরু।</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <strong className="brand-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Tourney Boss</strong>
              </Link>
              <p className="footer-about">
                Tourney Boss তৈরি করেছে DragonVerse Gaming — বাংলাদেশের গেমিং কমিউনিটির জন্য একটা
                স্বচ্ছ, নির্ভরযোগ্য টুর্নামেন্ট প্ল্যাটফর্ম বানানোর লক্ষ্যে।
              </p>
              <div className="social-row">
                {SOCIAL_LINKS.map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noreferrer" title={s.title} aria-label={s.title}>{s.label}</a>
                ))}
              </div>
            </div>

            <div className="footer-col">
              <h4>প্ল্যাটফর্ম</h4>
              <ul>
                <li><Link to="/tournaments">টুর্নামেন্ট</Link></li>
                <li><a href={PLAY_STORE_URL} target="_blank" rel="noreferrer">হোস্ট করো (App)</a></li>
                <li><Link to="/profile">ওয়ালেট</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>সাপোর্ট</h4>
              <ul>
                <li><a href="#faq">FAQ</a></li>
                <li><a href={FEEDBACK_GROUP_URL} target="_blank" rel="noreferrer">মতামত জানাও</a></li>
                <li><a href="https://discord.gg/YdfcnhS5mJ" target="_blank" rel="noreferrer">Discord এ যোগাযোগ</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>অ্যাপ</h4>
              <p style={{ color: 'var(--text-dim)', fontSize: '.88rem', marginBottom: 10 }}>
                টিম, ম্যাচ ও লাইভ চ্যাটের জন্য অ্যাপ নাও।
              </p>
              <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-block' }}>
                ▶️ Play Store
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <div>© 2026 Tourney Boss. সব অধিকার সংরক্ষিত।</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
