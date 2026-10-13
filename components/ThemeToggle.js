'use client'
import { useEffect, useState } from 'react'

// The first theme is applied by the tiny inline script in layout.js (before the
// page paints, so there's no flash). This button just reads that value and flips it.
export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('sy-theme', next) } catch (e) {}
  }

  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  return (<button type="button" className="b theme-toggle" onClick={toggle} aria-label={label} title={label}>
    <span className="ti">{theme === 'dark' ? '☀️' : '🌙'}</span>
  </button>)
}
