import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import RequireAuth from './components/RequireAuth'

// Route-based code splitting: each page loads only when visited,
// instead of all pages being bundled into the first download.
const Home = lazy(() => import('./pages/Home'))
const TournamentList = lazy(() => import('./pages/TournamentList'))
const TournamentDetails = lazy(() => import('./pages/TournamentDetails'))
const Login = lazy(() => import('./pages/Login'))
const PlayerDashboard = lazy(() => import('./pages/PlayerDashboard'))
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const Profile = lazy(() => import('./pages/Profile'))

function PageLoading() {
  return (
    <div style={{ padding: 'var(--space-12) 0', textAlign: 'center', color: 'var(--text-dim)' }}>
      লোড হচ্ছে…
    </div>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tournaments" element={<TournamentList />} />
        <Route path="/tournaments/:id" element={<TournamentDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/player" element={
          <ProtectedRoute role="member"><PlayerDashboard /></ProtectedRoute>
        } />
        <Route path="/organizer" element={
          <ProtectedRoute role="organizer"><OrganizerDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>
        } />
      </Routes>
      </Suspense>
    </>
  )
}
