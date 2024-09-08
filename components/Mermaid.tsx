'use client'
import { useEffect, useState } from 'react'
import mermaid from 'mermaid'

const Mermaid = ({ chart }) => {
  const [theme, setTheme] = useState<'default' | 'dark'>('default')

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleThemeChange = (e) => {
      setTheme(e.matches ? 'dark' : 'default')
    }

    setTheme(darkModeMediaQuery.matches ? 'dark' : 'default')
    darkModeMediaQuery.addEventListener('change', handleThemeChange)

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleThemeChange)
    }
  }, [])

  useEffect(() => {
    mermaid.initialize({ theme })
    mermaid.contentLoaded()
  }, [theme, chart])

  return <div className="mermaid">{chart}</div>
}

export default Mermaid
