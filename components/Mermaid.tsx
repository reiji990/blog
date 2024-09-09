'use client'
import { useEffect } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

const Mermaid = ({ chart }) => {
  const { theme, systemTheme } = useTheme()

  useEffect(() => {
    const mermaidTheme

    if (theme === 'system') {
      mermaidTheme = systemTheme === 'dark' ? 'dark' : 'default'
    } else {
      mermaidTheme = theme === 'dark' ? 'dark' : 'default'
    }

    mermaid.initialize({ theme: mermaidTheme })
    mermaid.contentLoaded()
  }, [theme, systemTheme, chart])

  return <div className="mermaid">{chart}</div>
}

export default Mermaid
