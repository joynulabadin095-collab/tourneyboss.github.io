import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, type AuthErrorDetail } from '../context/AuthContext'
import type { Role } from '../types'

// Translate Firebase error codes into something a user (or you, debugging)
// can actually act on. The raw code is still shown so nothing is hidden.
function describeError(err: AuthErrorDetail): { title: string; body: string } {
  switch (err.code) {
    case 'auth/popup-closed-by-user':
      return {
        title: 'পপ-আপ বন্ধ করে দিয়েছো',
        body: 'Google সাইন-ইনের পপ-আপ বন্ধ করায় লগইন হয়নি। আবার চেষ্টা করো — এবার পপ-আপটা বন্ধ করো না।',
      }
    case 'auth/popup-blocked':
      return {
        title: 'পপ-আপ ব্লক হয়ে গেছে',
        body: 'ব্রাউজার Google এর পপ-আপ ব্লক করে দিয়েছে। সাইটের পপ-আপ allow করে আবার চেষ্টা করো।',
      }
    case 'auth/cancelled-popup-request':
      return {
        title: 'লগইন বাতিল',
        body: 'একটা চলমান লগইন রিকোয়েস্ট ছিল, সেটা বাতিল হয়ে গেছে। আবার চেষ্টা করো।',
      }
    case 'auth/network-request-failed':
      return {
        title: 'নেটওয়ার্ক সমস্যা',
        body: 'ইন্টারনেট কানেকশন নেই বা অনেক দুর্বল। Wi-Fi / মোবাইল ডেটা চেক করে আবার চেষ্টা করো।',
      }
    case 'auth/too-many-requests':
      return {
        title: 'অনেকবার চেষ্টা হয়েছে',
        body: 'অনেকবার ভুল চেষ্টা হওয়ায় টেম্পোরারি ব্লক হয়েছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করো।',
      }
    case 'auth/user-disabled':
      return {
        title: 'অ্যাকাউন্ট নিষ্ক্রিয়',
        body: 'তোমার Google অ্যাকাউন্টটি অ্যাডমিন নিষ্ক্রিয় করে রেখেছে। সাপোর্টে যোগাযোগ করো।',
      }
    case 'auth/account-exists-with-different-credential':
      return {
        title: 'অ্যাকাউন্ট আগে থেকেই আছে',
        body: 'এই ইমেইল দিয়ে আগে অন্য পদ্ধতিতে সাইন-ইন করা হয়েছে। সেই পদ্ধতিটা দিয়ে লগইন করো।',
      }
    case 'auth/operation-not-allowed':
      return {
        title: 'Google লগইন বন্ধ আছে',
        body: 'Firebase Console এ Google provider enable করা নেই। অ্যাডমিনের সাথে যোগাযোগ করো।',
      }
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return {
        title: 'Firebase কনফিগ ভুল',
        body: 'Firebase API key সঠিক নয় বা সেট করা হয়নি। ডেভেলপারের সাথে যোগাযোগ করো।',
      }
    case 'auth/unauthorized-domain':
      return {
        title: 'ডোমেইন অনুমোদিত নয়',
        body: 'এই সাইটের ডোমেইন Firebase Authentication এ যোগ করা নেই।',
      }
    case 'auth/timeout':
      return {
        title: 'রিকোয়েস্ট টাইমআউট',
        body: 'Google থেকে রেসপন্স পেতে অনেক দেরি হচ্ছে। আবার চেষ্টা করো।',
      }
    default:
      return {
        title: 'সাইন-ইন করা যায়নি',
        body: err.message || 'অজানা একটা সমস্যা হয়েছে। আবার চেষ্টা করো।',
      }
  }
}

function ErrorPanel({ err, onClose }: { err: AuthErrorDetail; onClose: () => void }) {
  const { title, body } = describeError(err)
  return (
    <div
      role="alert"
      style={{
        background: 'rgba(255, 80, 80, 0.08)',
        border: '1px solid var(--danger)',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        fontSize: '0.92rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 4 }}>⚠ {title}</div>
          <div style={{ color: 'var(--text-dim)' }}>{body}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            background: 'transparent', border: 'none', color: 'var(--text-dim)',
            cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: 0,
          }}
        >×</button>
      </div>
      {/* Dev/debug details — Firebase code, raw message, cause, where it happened */}
      <details style={{ marginTop: 8, color: 'var(--text-dim)', fontSize: '0.82rem' }}>
        <summary style={{ cursor: 'pointer' }}>বিস্তারিত (debug)</summary>
        <div style={{ marginTop: 6, lineHeight: 1.6, wordBreak: 'break-word' }}>
          <div><strong>ধাপ:</strong> {err.at}</div>
          <div><strong>Firebase code:</strong> {err.code}</div>
          <div><strong>Message:</strong> {err.message}</div>
          {err.cause && <div><strong>কারণ:</strong> {err.cause}</div>}
        </div>
      </details>
    </div>
  )
}

export default function Login() {
  const { user, continueWithGoogle, needsRoleSelection, completeSignup, lastError, clearError } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('member')
  const [submitting, setSubmitting] = useState(false)

  // Already signed in (existing account — no role selection needed)?
  // Send them straight to their profile instead of leaving the login
  // form/button showing.
  useEffect(() => {
    if (user) navigate('/profile', { replace: true })
  }, [user, navigate])

  async function handleGoogleClick() {
    clearError()
    setSubmitting(true)
    try {
      await continueWithGoogle()
      // onAuthStateChanged handler will route via the role-selection flow.
    } catch {
      // Error is already in context; the panel below renders it.
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRoleConfirm() {
    clearError()
    setSubmitting(true)
    const ok = await completeSignup(role)
    setSubmitting(false)
    if (ok) {
      navigate('/profile', { replace: true })
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480, padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <span className="pill-badge" style={{ marginBottom: 18 }}>
          <span className="dot" />
          টুর্নামেন্ট + ওয়ালেট প্ল্যাটফর্ম&nbsp;·&nbsp;<span className="accent">লাইভ এখন</span>
        </span>
        <h1 className="gradient-text" style={{ fontSize: 'var(--text-xl)' }}>
          {needsRoleSelection ? 'তুমি কী হিসেবে যোগ দিতে চাও?' : 'Tourney Boss এ লগইন করো'}
        </h1>
        {!needsRoleSelection && (
          <p style={{ color: 'var(--text-dim)' }}>Google অ্যাকাউন্ট দিয়ে সরাসরি সাইন-ইন করো।</p>
        )}
      </div>

      <div className="glow-card" style={{ padding: 'var(--space-8)' }}>
        {!needsRoleSelection && (
          <button
            className="btn btn-google btn-block"
            style={{ width: '100%' }}
            onClick={handleGoogleClick}
            disabled={submitting}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z"/>
              <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58Z"/>
            </svg>
            {submitting ? 'অপেক্ষা করো...' : 'Continue with Google'}
          </button>
        )}

        {needsRoleSelection && (
          <>
            <div className="role-grid">
              <div
                className={`role-card${role === 'member' ? ' selected' : ''}`}
                onClick={() => setRole('member')}
              >
                <div className="ico">🎮</div>
                <h4>Player</h4>
                <p>টুর্নামেন্টে খেলবো</p>
              </div>
              <div
                className={`role-card${role === 'organizer' ? ' selected' : ''}`}
                onClick={() => setRole('organizer')}
              >
                <div className="ico">🏆</div>
                <h4>Organizer</h4>
                <p>টুর্নামেন্ট হোস্ট করবো</p>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleRoleConfirm} disabled={submitting}>
              {submitting ? 'অপেক্ষা করো...' : 'শুরু করো'}
            </button>
          </>
        )}

        {lastError && <ErrorPanel err={lastError} onClose={clearError} />}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '.85rem', marginTop: 'var(--space-6)' }}>
        <Link to="/" style={{ color: 'var(--text-dim)' }}>← হোমপেজে ফিরে যাও</Link>
      </p>
    </div>
  )
}
