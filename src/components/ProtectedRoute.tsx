import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

export default function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <p style={{ color: 'var(--text-dim)' }}>লোড হচ্ছে...</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return <>{children}</>
}
