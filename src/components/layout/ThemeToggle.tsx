'use client'

import { useEffect, useState, useCallback } from 'react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const dark = stored ? stored === 'dark' : true
    // Apply theme to DOM — also syncs React state to match persisted preference
    document.documentElement.classList.toggle('light', !dark)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(dark)
  }, [])

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      if (next) {
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
      }
      return next
    })
  }, [])

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        w-9 h-9 flex items-center justify-center rounded-lg
        text-text-secondary hover:text-text-primary
        hover:bg-card border border-transparent hover:border-border
        transition-all duration-150 cursor-pointer
        focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
      "
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
