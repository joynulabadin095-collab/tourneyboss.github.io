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

const ROLE_BADGE_COLOR: Record<Role, string> = {
  member: 'var(--success)',
  organizer: 'var(--gold)',
  admin: 'var(--danger)',
  sponsor_manager: 'var(--gold)',
}

export default function Profile() {
  const { user, loading } = useAuth()

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
          <p style={{ color: 'var(--text-dim)' }}>
            এই পেজ শুধু সাইন-ইন করা ইউজারদের জন্য।
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: 720, padding: '40px 0' }}>
      <h1>আমার প্রোফাইল</h1>
      <p style={{ color: 'var(--text-dim)', marginTop: -8, fontSize: '0.92rem' }}>
        এই পেজটা read-only — নাম, ফোন নম্বর ও অন্যান্য তথ্য পরিবর্তন করতে Tourney Boss
        অ্যাপে (Android) যাও।
      </p>

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
              <h2 style={{ margin: 0 }}>{user.name || '—'}</h2>
              <span className={`badge ${ROLE_BADGE[user.role]}`}>
                {ROLE_LABEL[user.role]}
              </span>
            </div>
            <div style={{ color: 'var(--text-dim)', marginTop: 4, fontSize: '0.92rem' }}>
              @{user.username || 'user'}
            </div>
            {user.role === 'member' && (
              <div style={{ marginTop: 8, color: 'var(--gold)', fontWeight: 600 }}>
                💎 Wallet Balance: {user.walletBalance}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account details — read-only fields */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3>অ্যাকাউন্ট তথ্য</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginTop: -4 }}>
          এই তথ্যগুলো শুধু দেখার জন্য — পরিবর্তন করতে অ্যাপে যাও।
        </p>

        <dl style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginTop: 14,
          marginBottom: 0,
        }}>
          <Field label="নাম" value={user.name || '—'} />
          <Field label="ইউজারনেম" value={user.username ? `@${user.username}` : '— (অ্যাপে সেট করো)'} />
          <Field label="হোয়াটসঅ্যাপ নম্বর" value={user.whatsapp || user.phone || '— (অ্যাপে সেট করো)'} />
          <Field label="Role" value={ROLE_LABEL[user.role]} />
        </dl>
      </div>

      {/* Game UIDs — written by the Android app, read-only here */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3>গেম আইডি</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginTop: -4 }}>
          অ্যাপে যেসব গেম আইডি যোগ করেছো, সেগুলো এখানে দেখা যাবে।
        </p>
        <dl style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginTop: 14,
          marginBottom: 0,
        }}>
          <Field label="MLBB UID" value={user.mlbbUid || 'যোগ করা হয়নি'} />
          <Field label="Free Fire UID" value={user.ffUid || 'যোগ করা হয়নি'} />
          <Field label="PUBG Mobile UID" value={user.pubgUid || 'যোগ করা হয়নি'} />
        </dl>
      </div>

      {/* Finance summary — for member only */}
      {user.role === 'member' && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>ফাইন্যান্স সারাংশ</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
          }}>
            <Stat label="Wallet Balance" value={`💎 ${user.walletBalance}`} />
            <Stat label="Account Type" value={ROLE_LABEL[user.role]} />
            <Stat label="Currency" value="Diamonds (💎) = ৳1" />
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginTop: 12 }}>
            বিস্তারিত লেনদেন দেখতে <a href="/player" style={{ color: 'var(--gold)' }}>Player Dashboard</a> দেখো —
            entry payments, hosting fees, cashouts সব এক জায়গায়।
          </p>
        </div>
      )}

      {/* Organizer finance summary */}
      {user.role === 'organizer' && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>ফাইন্যান্স সারাংশ</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem' }}>
            Organizer হিসেবে তোমার hosting fee submissions এবং tournament revenue এখানে দেখতে পারবে।
          </p>
          <p style={{ marginTop: 12 }}>
            <a href="/organizer" className="btn btn-primary">Organizer Dashboard এ যাও</a>
          </p>
        </div>
      )}

      {/* Admin finance summary */}
      {user.role === 'admin' && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>ফাইন্যান্স সারাংশ</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem' }}>
            Admin হিসেবে সব entry payments, hosting requests, cashouts approve/reject করার একমাত্র জায়গা এই website।
          </p>
          <p style={{ marginTop: 12 }}>
            <a href="/admin" className="btn btn-primary">Admin Panel এ যাও</a>
          </p>
        </div>
      )}

      <p style={{
        color: 'var(--text-dim)',
        fontSize: '0.82rem',
        textAlign: 'center',
        marginTop: 24,
      }}>
        Profile info: <span style={{ color: ROLE_BADGE_COLOR[user.role] }}>🔒 read-only</span>
        {' · '}এই website শুধু finance maintenance এর জন্য
      </p>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{
        color: 'var(--text-dim)',
        fontSize: '0.82rem',
        marginBottom: 4,
      }}>
        {label}
      </dt>
      <dd style={{
        margin: 0,
        color: 'var(--text)',
        fontSize: '1rem',
        padding: '8px 12px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        wordBreak: 'break-word',
      }}>
        {value}
      </dd>
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
      <div style={{ fontSize: '1.05rem', marginTop: 4, color: 'var(--text)' }}>{value}</div>
    </div>
  )
}
