'use client'
import { useEffect } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

const Mermaid = ({ chart }) => {
  const { theme } = useTheme() // ThemeProviderからテーマを取得

  useEffect(() => {
    const mermaidTheme = theme === 'dark' ? 'dark' : 'default' // テーマに基づいてmermaidのテーマを選択
    mermaid.initialize({ theme: mermaidTheme })
    mermaid.contentLoaded()
  }, [theme, chart]) // テーマやチャートが変更されたら再レンダリング

  return <div className="mermaid">{chart}</div>
}

export default Mermaid
