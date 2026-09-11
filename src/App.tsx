import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import TournamentList from './pages/TournamentList'
import TournamentDetails from './pages/TournamentDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import PlayerDashboard from './pages/PlayerDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tournaments" element={<TournamentList />} />
        <Route path="/tournaments/:id" element={<TournamentDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/player" element={
          <ProtectedRoute role="player"><PlayerDashboard /></ProtectedRoute>
        } />
        <Route path="/organizer" element={
          <ProtectedRoute role="organizer"><OrganizerDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>
        } />
      </Routes>
    </>
  )
}
