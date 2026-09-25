import { useEffect, useState } from 'react'

function split(msLeft: number) {
  const totalSec = Math.max(0, Math.floor(msLeft / 1000))
  return {
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
  }
}

// Renders nothing if there's no deadline set — a countdown to an unknown
// time would just be misleading, so absence of data means absence of UI.
export default function Countdown({ deadline, compact }: { deadline?: string; compact?: boolean }) {
  const target = deadline ? new Date(deadline).getTime() : null
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!target) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [target])

  if (!target) return null
  const msLeft = target - now

  if (msLeft <= 0) {
    return <span className={compact ? 'badge badge-rejected' : 'countdown-ended'}>রেজিস্ট্রেশন বন্ধ হয়ে গেছে</span>
  }

  const { h, m, s } = split(msLeft)
  const pad = (n: number) => String(n).padStart(2, '0')

  if (compact) {
    return <span className="countdown-compact">⏱ {pad(h)}:{pad(m)}:{pad(s)}</span>
  }

  return (
    <div className="countdown-box-row">
      <div className="countdown-box"><div className="num">{pad(h)}</div><div className="label">ঘণ্টা</div></div>
      <div className="countdown-box"><div className="num">{pad(m)}</div><div className="label">মিনিট</div></div>
      <div className="countdown-box"><div className="num">{pad(s)}</div><div className="label">সেকেন্ড</div></div>
    </div>
  )
}
