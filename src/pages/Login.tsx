import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

export default function Login() {
  const { continueWithGoogle, needsRoleSelection, completeSignup } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('member')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleGoogleClick() {
    setError('')
    setSubmitting(true)
    try {
      await continueWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google দিয়ে সাইন-ইন করা যায়নি')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRoleConfirm() {
    setError('')
    setSubmitting(true)
    const ok = await completeSignup(role)
    setSubmitting(false)
    if (ok) {
      navigate(role === 'organizer' ? '/organizer' : '/player')
    } else {
      setError('অ্যাকাউন্ট তৈরি করা যায়নি, আবার চেষ্টা করো')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 380, padding: '60px 20px' }}>
      <h1>লগইন</h1>
      <div className="card">
        {!needsRoleSelection && (
          <>
            <p style={{ color: 'var(--text-dim)' }}>Google অ্যাকাউন্ট দিয়ে সাইন-ইন করো।</p>
            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleGoogleClick} disabled={submitting}>
              {submitting ? 'অপেক্ষা করো...' : 'Continue with Google'}
            </button>
          </>
        )}

        {needsRoleSelection && (
          <>
            <p style={{ color: 'var(--text-dim)' }}>তোমার অ্যাকাউন্ট প্রথমবার তৈরি হচ্ছে — তুমি কী হিসেবে যোগ দিতে চাও?</p>
            <div className="field">
              <select value={role} onChange={e => setRole(e.target.value as Role)}>
                <option value="member">Player — টুর্নামেন্টে খেলবো</option>
                <option value="organizer">Organizer — টুর্নামেন্ট হোস্ট করবো</option>
              </select>
            </div>
            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleRoleConfirm} disabled={submitting}>
              {submitting ? 'অপেক্ষা করো...' : 'শুরু করো'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
