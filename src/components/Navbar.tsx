import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BackendStatus from './BackendStatus'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  async function handleLogout() {
    setDrawerOpen(false)
    await logout()
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'admin' ? '/admin' :
    user?.role === 'organizer' ? '/organizer' :
    user?.role === 'member' ? '/player' :
    user?.role === 'sponsor_manager' ? '/sponsor' : '/'

  const close = () => setDrawerOpen(false)

  return (
    <>
    <header style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="container navbar-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/trophy.svg" alt="" width={24} height={24} />
          <strong className="brand-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Tourney Boss</strong>
        </Link>

        {/* Desktop nav — hidden on mobile via CSS media query */}
        <nav className="navbar-nav">
          <Link to="/tournaments" style={{ color: 'var(--text-dim)' }}>টুর্নামেন্ট</Link>
          {user ? (
            <>
              <Link to={dashboardPath} style={{ color: 'var(--text-dim)' }}>ড্যাশবোর্ড</Link>
              <Link to="/profile" style={{ color: 'var(--text-dim)' }}>প্রোফাইল</Link>
              {user.role === 'member' && (
                <span className="badge badge-approved">💎 {user.walletBalance}</span>
              )}
              <button className="btn btn-outline" onClick={handleLogout}>লগআউট</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">লগইন</Link>
          )}
        </nav>

        {/* Hamburger — visible on mobile via CSS media query */}
        <button
          className="hamburger-btn"
          aria-label="মেনু খোলো"
          onClick={() => setDrawerOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 0' }}>
        <BackendStatus />
      </div>
    </header>

    {/* Slide-in drawer menu (mobile) — rendered outside <header> on purpose:
        header has backdrop-filter for its glass effect, and backdrop-filter
        creates a new containing block for position:fixed children, which was
        trapping this drawer inside the header's own (short) height instead of
        the full viewport. */}
      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={close} />
      <nav className={`drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="drawer-head">
          <strong className="brand-gradient" style={{ fontFamily: 'var(--font-display)' }}>মেনু</strong>
          <button className="drawer-close" onClick={close} aria-label="মেনু বন্ধ করো">✕</button>
        </div>

        <div className="drawer-nav">
          <Link to="/" onClick={close}>🏠 হোম</Link>
          <Link to="/tournaments" onClick={close}>🏆 টুর্নামেন্ট</Link>

          {user && (
            <>
              <div className="divider" />
              <Link to={dashboardPath} onClick={close}>📊 ড্যাশবোর্ড</Link>
              <Link to="/profile" onClick={close}>👤 প্রোফাইল</Link>
              {user.role === 'member' && (
                <div style={{ padding: '10px 14px' }}>
                  <span className="badge badge-approved">💎 {user.walletBalance}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="drawer-foot">
          {user ? (
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleLogout}>লগআউট</button>
          ) : (
            <Link to="/login" onClick={close} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              লগইন
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}
