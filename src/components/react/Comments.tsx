import { useEffect, useRef, useState } from 'react'
import siteMetadata from '@/data/siteMetadata.mjs'

/**
 * components/Comments.tsx の移植。
 *
 * Next 版は pliny/comments に giscus の読み込みを任せていたが、pliny を
 * 依存から外すためスクリプト注入を自前で行う。挙動（ボタンを押すまで
 * 何も読み込まない）と giscus に渡す設定は Next 版と同一。
 *
 * テーマは next-themes の Context ではなく documentElement の class を見る。
 * 島は独立した React ツリーなので Context に到達できないため。
 */
export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const config = siteMetadata.comments?.giscusConfig

  useEffect(() => {
    if (!loadComments || !containerRef.current || !config) return
    // 二重注入を防ぐ（StrictMode での再実行対策）
    if (containerRef.current.querySelector('script')) return

    const isDark = document.documentElement.classList.contains('dark')
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.crossOrigin = 'anonymous'
    script.async = true
    const attrs: Record<string, string | undefined> = {
      'data-repo': config.repo,
      'data-repo-id': config.repositoryId,
      'data-category': config.category,
      'data-category-id': config.categoryId,
      'data-mapping': config.mapping,
      'data-reactions-enabled': config.reactions,
      'data-emit-metadata': config.metadata,
      'data-theme': isDark ? config.darkTheme : config.theme,
      'data-lang': config.lang ?? 'ja',
      'data-loading': 'lazy',
    }
    for (const [key, value] of Object.entries(attrs)) {
      if (value != null) script.setAttribute(key, String(value))
    }
    containerRef.current.appendChild(script)
  }, [loadComments, config, slug])

  if (!siteMetadata.comments?.provider) return null

  return (
    <>
      {loadComments ? (
        <div ref={containerRef} className="giscus" />
      ) : (
        <button onClick={() => setLoadComments(true)}>コメントを読み込む</button>
      )}
    </>
  )
}
