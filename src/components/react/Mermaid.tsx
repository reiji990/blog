import { useEffect, useId, useState } from 'react'
import type { MermaidConfig } from 'mermaid'

type MermaidProps = {
  chart: string
}

// Next 版との唯一の差分: next-themes の useTheme() を DOM 監視に置き換える。
// island は独立した React ツリーなので ThemeProvider の Context に到達できない。
function useResolvedTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return theme
}

const Mermaid = ({ chart }: MermaidProps) => {
  const resolvedTheme = useResolvedTheme()
  const rawId = useId()
  // useIdの戻り値(":r0:"等)はCSSセレクタとして無効な文字を含むためサニタイズする
  const id = 'mermaid-' + rawId.replace(/[^a-zA-Z0-9]/g, '')
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // 新しい描画を開始する間は、まず元のチャートテキスト表示へフォールバックする
    setSvg(null)

    const renderChart = async () => {
      try {
        const { default: mermaid } = await import('mermaid')
        const theme: MermaidConfig['theme'] = resolvedTheme === 'dark' ? 'dark' : 'default'
        mermaid.initialize({ startOnLoad: false, theme })
        const { svg: renderedSvg } = await mermaid.render(id, chart)
        if (!cancelled) {
          setSvg(renderedSvg)
        }
      } catch (error) {
        // 構文エラー等はフォールバック表示に任せ、コンソールにのみ出力する
        console.error('Mermaidの描画に失敗しました:', error)
        // mermaid v11はエラー時に一時要素をDOMに残すことがあるため掃除する
        document.getElementById(id)?.remove()
        document.getElementById(`d${id}`)?.remove()
      }
    }

    renderChart()

    return () => {
      cancelled = true
    }
  }, [resolvedTheme, chart, id]) // テーマやチャートが変更されたら再レンダリング

  if (!svg) {
    // SSR出力と一致させるため、取得前は元のチャートテキストを表示する
    return <div className="mermaid">{chart}</div>
  }

  return <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />
}

export default Mermaid
