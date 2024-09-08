'use client'
import mermaid from 'mermaid'
import { useEffect } from 'react'
import { useTheme } from 'next-themes'

const Mermaid = ({ chart }: { chart: string }) => {
  const { theme } = useTheme() // current theme from next-themes

  useEffect(() => {
    // Define theme configurations with exact types
    const themeConfig: Record<string, 'default' | 'dark' | 'base' | 'forest' | 'neutral' | 'null'> =
      {
        light: 'default', // Mermaid.js default light theme
        dark: 'dark', // Mermaid.js dark theme
      }

    // Initialize Mermaid with the current theme
    mermaid.initialize({
      startOnLoad: true,
      theme: themeConfig[theme] || 'default', // Use default if theme is undefined
    })
    mermaid.contentLoaded()
  }, [chart, theme]) // Re-run effect when chart or theme changes

  return <div className="mermaid">{chart}</div>
}

export default Mermaid
