import { useAuth } from '../context/AuthContext'

// Sponsor Manager role exists (see types.ts) but the backend has no sponsor
// endpoints or Tournament fields yet — this is a UI-only placeholder so the
// role has somewhere to land instead of bouncing back to Home. Once the
// backend adds sponsor data, replace the cards below with real fetched data
// (same pattern as PlayerDashboard/OrganizerDashboard: useEffect + store.ts).
export default function SponsorDashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <p style={{ color: 'var(--text-dim)' }}>লোড হচ্ছে...</p>
      </div>
    )
  }
  if (!user) return null

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <span className="pill-badge" style={{ marginBottom: 18 }}>
          <span className="dot" /> Sponsor Manager
        </span>
        <h1 style={{ marginBottom: 8 }}>স্বাগতম, {user.name || 'Sponsor'}!</h1>
        <p style={{ color: 'var(--text-dim)' }}>
          তোমার Sponsor Manager ড্যাশবোর্ড এখনো তৈরি হচ্ছে — ব্যাকএন্ডে sponsor ডেটা যোগ হলেই
          নিচের সেকশনগুলো লাইভ হবে।
        </p>

        <div className="glow-card" style={{ marginTop: 'var(--space-8)', textAlign: 'center', padding: 'var(--space-8)' }}>
          <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>🚧</div>
          <h2>শীঘ্রই আসছে</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
            স্পনসরশিপ ম্যানেজমেন্ট ফিচার নিয়ে কাজ চলছে।
          </p>
        </div>

        <div className="feature-grid" style={{ marginTop: 'var(--space-8)' }}>
          <div className="feature" style={{ opacity: 0.55 }}>
            <div className="ico">🏆</div>
            <h3>স্পনসর করা টুর্নামেন্ট</h3>
            <p>তুমি যেসব টুর্নামেন্ট স্পনসর করছো, তাদের তালিকা এখানে দেখা যাবে।</p>
          </div>
          <div className="feature" style={{ opacity: 0.55 }}>
            <div className="ico">💳</div>
            <h3>পেমেন্ট হিস্ট্রি</h3>
            <p>স্পনসরশিপ পেমেন্টের সব রেকর্ড এখানে ট্র্যাক করা যাবে।</p>
          </div>
          <div className="feature" style={{ opacity: 0.55 }}>
            <div className="ico">📝</div>
            <h3>নতুন স্পনসরশিপ রিকোয়েস্ট</h3>
            <p>নতুন টুর্নামেন্ট স্পনসর করার আবেদন এখান থেকে করা যাবে।</p>
          </div>
        </div>
      </div>
    </div>
  )
}
