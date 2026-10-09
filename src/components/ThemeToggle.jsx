import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }, [dark])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystem = () => {
      try { if (!localStorage.getItem('zudo_theme')) setDark(media.matches) } catch {}
    }
    const syncStorage = (event) => {
      if (event.key === 'zudo_theme') setDark(event.newValue ? event.newValue === 'dark' : media.matches)
    }
    media.addEventListener('change', syncSystem)
    const syncToggle = (event) => setDark(event.detail)
    window.addEventListener('zudo-theme-change', syncToggle)
    window.addEventListener('storage', syncStorage)
    return () => {
      media.removeEventListener('change', syncSystem)
      window.removeEventListener('storage', syncStorage)
      window.removeEventListener('zudo-theme-change', syncToggle)
    }
  }, [])

  function toggle() {
    const next = !dark
    try { localStorage.setItem('zudo_theme', next ? 'dark' : 'light') } catch {}
    setDark(next)
    window.dispatchEvent(new CustomEvent('zudo-theme-change', { detail: next }))
  }

  return (
    <button type="button" onClick={toggle} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
      aria-pressed={dark} title={`Switch to ${dark ? 'light' : 'dark'} mode`}
      className="theme-toggle inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500">
      {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      <span className="sr-only">{dark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}
