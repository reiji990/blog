import { getCollection, type CollectionEntry } from 'astro:content'
import readingTimeOf from 'reading-time'
import siteMetadata from '@/data/siteMetadata.mjs'

export type BlogEntry = CollectionEntry<'blog'>
export type AuthorEntry = CollectionEntry<'authors'>

const isProduction = import.meta.env.PROD

/**
 * 1ページあたりの記事数（Next 版の app/blog/page.tsx と同値）。
 *
 * Astro の getStaticPaths は コンポーネントのスコープ外へ巻き上げられるため、
 * frontmatter で宣言した定数を参照できない（POSTS_PER_PAGE is not defined になる）。
 * import は巻き上げ後も解決されるので、共有モジュールに置いて import する。
 */
export const POSTS_PER_PAGE = 50

/**
 * pliny/utils/contentlayer の sortPosts 相当。
 * 日付の降順（新しい順）。同値なら元の順序を保つ。
 */
export function sortPosts(posts: BlogEntry[]): BlogEntry[] {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
}

/**
 * pliny/utils/contentlayer の allCoreContent 相当。
 * contentlayer 版は本番ビルドでのみ draft を落としていたので同じ挙動にする。
 */
export function publishedPosts(posts: BlogEntry[]): BlogEntry[] {
  return isProduction ? posts.filter((p) => p.data.draft !== true) : posts
}

/** 公開記事を日付降順で取得する（各ページの入口） */
export async function getSortedPosts(): Promise<BlogEntry[]> {
  return sortPosts(publishedPosts(await getCollection('blog')))
}

/** contentlayer の computedFields.path 相当（例: "blog/watanare02"） */
export function postPath(entry: BlogEntry): string {
  return `blog/${entry.id}`
}

/** contentlayer の computedFields.filePath 相当（GitHub の編集リンクに使う） */
export function postFilePath(entry: BlogEntry): string {
  return entry.filePath ?? `data/blog/${entry.id}.mdx`
}

/** contentlayer の computedFields.readingTime 相当 */
export function postReadingTime(entry: BlogEntry) {
  return readingTimeOf(entry.body ?? '')
}

/** frontmatter の images から表示用の1枚目を取り出す */
export function firstImage(entry: BlogEntry): string | undefined {
  const images = entry.data.images
  if (!images) return undefined
  return Array.isArray(images) ? images[0] : images
}

/**
 * contentlayer の computedFields.structuredData 相当。
 * 出力キーと順序を Next 版に合わせてある。
 */
export function structuredData(entry: BlogEntry) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: entry.data.title,
    datePublished: entry.data.date.toISOString(),
    dateModified: (entry.data.lastmod ?? entry.data.date).toISOString(),
    description: entry.data.summary,
    image: firstImage(entry) ?? siteMetadata.socialBanner,
    url: `${siteMetadata.siteUrl}/${postPath(entry)}`,
  }
}

/**
 * layouts の選択。frontmatter の layout は remark-rename-layout.mjs によって
 * postLayout へ退避されているため、両方を見る。
 */
export function layoutName(entry: BlogEntry): string {
  return entry.data.postLayout ?? entry.data.layout ?? 'PostLayout'
}

/** 前後の記事（Next 版の prev/next と同じく日付降順の並びを基準にする） */
export function siblings(posts: BlogEntry[], current: BlogEntry) {
  const index = posts.findIndex((p) => p.id === current.id)
  return {
    // 一覧は新しい順なので、配列の後ろが「前の記事」
    prev: index >= 0 && index + 1 < posts.length ? posts[index + 1] : undefined,
    next: index > 0 ? posts[index - 1] : undefined,
  }
}
