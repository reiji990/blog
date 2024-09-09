'use client'
import { useEffect } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

const Mermaid = ({ chart }) => {
  const { theme, systemTheme } = useTheme() || {} // 初期値を空オブジェクトにする

  useEffect(() => {
    if (!theme && !systemTheme) return // themeがまだ初期化されていない場合は処理をスキップ

    let mermaidTheme

    if (theme === 'system') {
      // システムテーマが有効ならOSのテーマに基づいてmermaidのテーマを選択
      mermaidTheme = systemTheme === 'dark' ? 'dark' : 'default'
    } else {
      // ユーザー設定のテーマに基づいてmermaidのテーマを選択
      mermaidTheme = theme === 'dark' ? 'dark' : 'default'
    }

    // Mermaidのテーマを適用
    mermaid.initialize({ theme: mermaidTheme })
    mermaid.contentLoaded()
  }, [theme, systemTheme, chart]) // テーマやチャートが変更されたら再レンダリング

  return <div className="mermaid">{chart}</div>
}

export default Mermaid
