import { useEffect, useRef, useState } from 'react'

// Adds the "in" class once an element scrolls into view, matching the
// .reveal / .reveal.in CSS pair in index.css. Only fires once per element.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { ref, className: `reveal${visible ? ' in' : ''}` }
}
