import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'admin' ? '/admin' :
    user?.role === 'organizer' ? '/organizer' :
    user?.role === 'player' ? '/player' : '/'

  return (
    <header style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="container navbar-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/trophy.svg" alt="" width={24} height={24} />
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Tourney Boss</strong>
        </Link>

        <nav className="navbar-nav">
          <Link to="/tournaments" style={{ color: 'var(--text-dim)' }}>টুর্নামেন্ট</Link>
          {user ? (
            <>
              <Link to={dashboardPath} style={{ color: 'var(--text-dim)' }}>ড্যাশবোর্ড</Link>
              {user.role === 'player' && (
                <span className="badge badge-approved">💎 {user.walletBalance}</span>
              )}
              <button className="btn btn-outline" onClick={handleLogout}>লগআউট</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">লগইন</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
