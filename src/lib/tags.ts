import { slug } from 'github-slugger'
import { getSortedPosts, type BlogEntry } from './content'

/**
 * contentlayer.config.ts の createTagCount 相当。
 * Next 版はビルド時に app/tag-data.json を書き出していたが、Astro では
 * コレクションから毎回導出する（生成ファイルを持たない分ズレようがない）。
 *
 * キーは github-slugger で slug 化した値。日本語タグはそのまま日本語が残る。
 */
export async function getTagCounts(): Promise<Record<string, number>> {
  const posts = await getSortedPosts()
  const counts: Record<string, number> = {}
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      const key = slug(tag)
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return counts
}

/** 出現数の降順に並べたタグ slug の一覧 */
export async function getSortedTags(): Promise<[string, number][]> {
  const counts = await getTagCounts()
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

/** 指定タグ（slug 済み）を含む記事 */
export function postsWithTag(posts: BlogEntry[], tagSlug: string): BlogEntry[] {
  return posts.filter((post) => (post.data.tags ?? []).map((t) => slug(t)).includes(tagSlug))
}

/**
 * タグ slug から表示用の元タグ名を引く。
 * slug 化で失われる表記（大文字等）を戻すため、実データから逆引きする。
 */
export function displayTag(posts: BlogEntry[], tagSlug: string): string {
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      if (slug(tag) === tagSlug) return tag
    }
  }
  return tagSlug
}
