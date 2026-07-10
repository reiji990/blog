'use client'
import { useEffect } from 'react'
import { useTheme } from 'next-themes'

const Mermaid = ({ chart }) => {
  const { theme } = useTheme() // ThemeProviderからテーマを取得

  useEffect(() => {
    let cancelled = false
    // mermaid本体(重量ライブラリ)は初期バンドルから外し、マウント時にのみ動的importする
    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled) return
      const mermaidTheme = theme === 'dark' ? 'dark' : 'default' // テーマに基づいてmermaidのテーマを選択
      mermaid.initialize({ theme: mermaidTheme })
      mermaid.contentLoaded()
    })
    return () => {
      cancelled = true
    }
  }, [theme, chart]) // テーマやチャートが変更されたら再レンダリング

  return <div className="mermaid">{chart}</div>
}

export default Mermaid
