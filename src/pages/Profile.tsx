import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

const ROLE_LABEL: Record<Role, string> = {
  member: 'Player',
  organizer: 'Organizer',
  admin: 'Admin',
  sponsor_manager: 'Sponsor Manager',
}

const ROLE_BADGE: Record<Role, string> = {
  member: 'badge-approved',
  organizer: 'badge-pending',
  admin: 'badge-rejected',
  sponsor_manager: 'badge-pending',
}

function readOnlyRoleCopy(role: Role): string {
  switch (role) {
    case 'admin':
      return 'Admin role Firebase / backend দিয়ে সেট হয় — এখানে পরিবর্তন করা যাবে না।'
    case 'sponsor_manager':
      return 'Sponsor Manager role backend দিয়ে সেট হয়।'
    default:
      return ''
  }
}

export default function Profile() {
  const { user, loading, refresh, updateProfile } = useAuth()

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
    }
  }, [user])

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <p style={{ color: 'var(--text-dim)' }}>লোড হচ্ছে...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className="card">
          <h2>প্রোফাইল দেখতে লগইন করো</h2>
          <p style={{ color: 'var(--text-dim)' }}>প্রোফাইল পেজ শুধু সাইন-ইন করা ইউজারদের জন্য।</p>
        </div>
      </div>
    )
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Capture the user locally so TypeScript narrows it inside this closure.
    const currentUser = user
    if (!currentUser) return

    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName) {
      setError('নাম দিতেই হবে')
      return
    }
    // BD phone: 01XXXXXXXXX (11 digits), or +8801XXXXXXXXX
    if (trimmedPhone && !/^(\+?880)?1[3-9]\d{8}$/.test(trimmedPhone)) {
      setError('ফোন নম্বর সঠিক নয় (যেমন: 01712345678)')
      return
    }
    if (trimmedName === currentUser.name && trimmedPhone === currentUser.phone) {
      setError('কিছুই পরিবর্তন হয়নি')
      return
    }

    setSaving(true)
    try {
      await updateProfile({ name: trimmedName, phone: trimmedPhone })
      await refresh()
      setSuccess('প্রোফাইল আপডেট হয়েছে')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'আপডেট করা যায়নি')
    } finally {
      setSaving(false)
    }
  }

  const memberSince = (() => {
    // Firebase UID has no timestamp, so we just show "-" unless backend sends createdAt.
    return '—'
  })()

  return (
    <div className="container" style={{ maxWidth: 720, padding: '40px 0' }}>
      <h1>আমার প্রোফাইল</h1>

      {/* Identity card — read-only */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              style={{
                width: 72, height: 72, borderRadius: '50%',
                border: '2px solid var(--gold)', objectFit: 'cover',
                background: 'var(--surface-2)',
              }}
            />
          ) : (
            <div
              aria-hidden
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', color: 'var(--text-dim)',
                border: '2px solid var(--border)',
              }}
            >
              {user.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>{user.name}</h2>
              <span className={`badge ${ROLE_BADGE[user.role]}`}>{ROLE_LABEL[user.role]}</span>
            </div>
            <div style={{ color: 'var(--text-dim)', marginTop: 4, fontSize: '0.92rem' }}>
              UID: <code style={{ color: 'var(--text)' }}>{user.uid}</code>
            </div>
            {user.role === 'member' && (
              <div style={{ marginTop: 8, color: 'var(--gold)', fontWeight: 600 }}>
                💎 Wallet Balance: {user.walletBalance}
              </div>
            )}
          </div>
        </div>

        {readOnlyRoleCopy(user.role) && (
          <p style={{ color: 'var(--text-dim)', marginTop: 12, fontSize: '0.9rem' }}>
            {readOnlyRoleCopy(user.role)}
          </p>
        )}
      </div>

      {/* Edit form */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3>প্রোফাইল এডিট করো</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem' }}>
          তোমার নাম ও ফোন নম্বর এখান থেকে আপডেট করতে পারবে। ইমেইল ও Google photo
          তোমার Google অ্যাকাউন্ট থেকে আসে — সেগুলো এখান থেকে পরিবর্তন হয় না।
        </p>

        <form onSubmit={handleSave} style={{ marginTop: 12 }}>
          <div className="field">
            <label>নাম</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={60}
              required
              placeholder="তোমার পুরো নাম"
            />
          </div>

          <div className="field">
            <label>ফোন নম্বর</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              maxLength={20}
              placeholder="01712345678"
            />
            <small style={{ color: 'var(--text-dim)' }}>
              bKash cashout এ এই নম্বর ব্যবহার করা হবে
            </small>
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', marginTop: 4 }} role="alert">{error}</p>
          )}
          {success && (
            <p style={{ color: 'var(--gold)', marginTop: 4 }} role="status">{success}</p>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'সেভ হচ্ছে...' : 'সেভ করো'}
            </button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => {
                setName(user.name)
                setPhone(user.phone)
                setError('')
                setSuccess('')
              }}
              disabled={saving}
            >
              বাতিল
            </button>
          </div>
        </form>
      </div>

      {/* Finance summary — read-only, quick glance */}
      {user.role === 'member' && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>অ্যাকাউন্ট সারাংশ</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <Stat label="Wallet Balance" value={`💎 ${user.walletBalance}`} />
            <Stat label="Role" value={ROLE_LABEL[user.role]} />
            <Stat label="Member since" value={memberSince} />
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginTop: 12 }}>
            বিস্তারিত লেনদেন দেখতে <a href="/player" style={{ color: 'var(--gold)' }}>Player Dashboard</a> দেখো।
          </p>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 12,
      }}
    >
      <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', marginTop: 4, color: 'var(--text)' }}>{value}</div>
    </div>
  )
}
