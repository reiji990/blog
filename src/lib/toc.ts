import type { MarkdownHeading } from 'astro'

export interface TocEntry {
  value: string
  url: string
  depth: number
  children?: TocEntry[]
}

/**
 * Astro の render() が返す headings を pliny の extractTocHeadings と
 * 同じ形（value / url / depth）へ変換する。
 *
 * 【差分】pliny は生の MDX ソースを走査するのに対し、Astro の headings は
 * remark 実行後の AST 由来。そのため remark-gfm が脚注セクション用に生成する
 * <h2 id="footnote-label">Footnotes</h2> が Astro 側だけ混入する。
 * 生成物なので除外する。
 */
export function toToc(headings: MarkdownHeading[]): TocEntry[] {
  return headings
    .filter((h) => h.slug !== 'footnote-label')
    .map((h) => ({ value: h.text, url: `#${h.slug}`, depth: h.depth }))
}

/** pliny の createNestedList と同一アルゴリズム（depth を見て入れ子にする） */
export function nestToc(items: TocEntry[]): TocEntry[] {
  const nested: TocEntry[] = []
  const stack: TocEntry[] = []
  for (const item of items) {
    const node = { ...item }
    while (stack.length > 0 && stack[stack.length - 1].depth >= node.depth) {
      stack.pop()
    }
    const parent = stack.length > 0 ? stack[stack.length - 1] : null
    if (parent) {
      parent.children = parent.children || []
      parent.children.push(node)
    } else {
      nested.push(node)
    }
    stack.push(node)
  }
  return nested
}
