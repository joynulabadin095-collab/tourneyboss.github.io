import { useEffect, useRef, useState } from 'react'
import { API_BASE_URL } from '../data/api'

type Status = 'checking' | 'online' | 'offline'

// Render's free tier puts the backend to sleep after ~15 min idle, and the
// first request after that takes 30-50s to wake it up. This pings /health
// on load and every 4 minutes while the tab is open, so the backend stays
// warm for as long as someone has the site open — no action needed from them.
const PING_INTERVAL_MS = 4 * 60 * 1000

export default function BackendStatus() {
  const [status, setStatus] = useState<Status>('checking')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function ping() {
    setStatus('checking')
    try {
      const res = await fetch(`${API_BASE_URL}/health`)
      setStatus(res.ok ? 'online' : 'offline')
    } catch {
      setStatus('offline')
    }
  }

  useEffect(() => {
    ping()
    timerRef.current = setInterval(ping, PING_INTERVAL_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const color =
    status === 'online' ? 'var(--success)' : status === 'offline' ? 'var(--danger)' : 'var(--text-dim)'
  const label =
    status === 'online' ? 'Server active' : status === 'offline' ? 'Server sleeping' : 'Checking…'

  return (
    <button
      onClick={ping}
      title="Ping the backend now"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: '0.7rem',
        color: 'var(--text-dim)',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          boxShadow: status === 'online' ? `0 0 6px ${color}` : 'none',
          flexShrink: 0,
        }}
      />
      {label}
    </button>
  )
}
