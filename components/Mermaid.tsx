'use client'
import { useEffect } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

const Mermaid = ({ chart }) => {
  const { theme, systemTheme } = useTheme();  // テーマとシステムテーマを取得

  useEffect(() => {
    if (!theme) return;  // テーマが設定されていない場合は何もしない

    let mermaidTheme;

    if (theme === 'system') {
      // システムテーマに基づいてmermaidテーマを設定
      if (systemTheme === 'dark') {
        mermaidTheme = 'dark';
      } else if (systemTheme === 'light') {
        mermaidTheme = 'default';
      }
    } else {
      // ユーザーが手動で選択したテーマに基づいてmermaidテーマを設定
      mermaidTheme = theme === 'dark' ? 'dark' : 'default';
    }

    // Mermaidのテーマを設定
    mermaid.initialize({ theme: mermaidTheme });
    mermaid.contentLoaded();
  }, [theme, systemTheme, chart]);  // テーマやチャートの変更を監視

  return <div className="mermaid">{chart}</div>;
};

export default Mermaid;