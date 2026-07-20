// MDX/Markdown 記法を簡易的に除去してプレーンテキストの抜粋を作るユーティリティ。
// summary フロントマターの無い記事のために要約文を作る用途に限定しているため、
// 完全な MDX パーサーではなく正規表現ベースの簡易実装とする。
// (MDX 独自コンポーネントタグ等が抜粋に残ることは許容する)

/**
 * MDX/Markdown 本文からタグ・記法を取り除いたプレーンテキストを返す。
 * @param {string} raw MDX/Markdown 本文 (body.raw)
 * @returns {string}
 */
export function stripMarkdown(raw) {
  return (
    raw
      // コードブロック (中身ごと除去)
      .replace(/```[\s\S]*?```/g, ' ')
      // 数式ブロック ($$...$$)
      .replace(/\$\$[\s\S]*?\$\$/g, ' ')
      // インラインコード
      .replace(/`([^`]*)`/g, '$1')
      // footnote 参照/定義 ([^1], [^1]: ...)
      .replace(/\[\^[^\]]*\]:?/g, '')
      // 画像 ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      // リンク [text](url)
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // HTML/JSX タグ (<ruby>, <br/>, <Source> など。中身は残す)
      .replace(/<\/?[a-zA-Z][^>]*>/g, '')
      // 見出しマーカー
      .replace(/^#{1,6}\s+/gm, '')
      // 引用マーカー
      .replace(/^>\s?/gm, '')
      // 強調 (bold/italic)
      .replace(/(\*\*\*|___)(.+?)\1/g, '$2')
      .replace(/(\*\*|__)(.+?)\1/g, '$2')
      .replace(/(\*|_)(.+?)\1/g, '$2')
      // リストマーカー
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // テーブル (区切り行 |---|---| は除去し、セル区切りの | は空白へ)
      .replace(/^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/gm, ' ')
      .replace(/^\s*\|(.*)\|\s*$/gm, (_, inner) => ` ${inner.replace(/\|/g, ' ')} `)
      // 水平線
      .replace(/^\s*([-*_])(\s*\1){2,}\s*$/gm, '')
      // 空白の正規化
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/**
 * MDX/Markdown 本文冒頭からプレーンテキストを抜粋する。
 * @param {string} raw MDX/Markdown 本文 (body.raw)
 * @param {number} maxLen 抜粋する最大文字数
 * @param {{ ellipsis?: boolean }} [options] ellipsis: 切り詰めが発生した場合に `…` を付与する
 * @returns {string}
 */
export function excerpt(raw, maxLen, options = {}) {
  const { ellipsis = false } = options
  const text = stripMarkdown(raw)
  if (text.length <= maxLen) return text
  const truncated = text.slice(0, maxLen)
  return ellipsis ? `${truncated}…` : truncated
}
