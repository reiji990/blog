'use client'
import { useEffect, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral' | 'base' | null

const Mermaid = ({ chart }) => {
  const { theme, systemTheme } = useTheme()
  const [mermaidTheme, setMermaidTheme] = useState<MermaidTheme>('default')

  useEffect(() => {
    if (!theme) return

    let currentTheme: MermaidTheme
    if (theme === 'system') {
      currentTheme = systemTheme === 'dark' ? 'dark' : 'default'
    } else {
      currentTheme = theme === 'dark' ? 'dark' : 'default'
    }

    setMermaidTheme(currentTheme)
  }, [theme, systemTheme])

  useEffect(() => {
    if (mermaidTheme) {
      mermaid.initialize({ theme: mermaidTheme })
      mermaid.contentLoaded()
    }
  }, [mermaidTheme, chart])

  return <div className="mermaid">{chart}</div>
}

export default Mermaid
