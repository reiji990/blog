import type { APIRoute } from 'astro'
import { getSortedPosts, postPath } from '@/lib/content'

/**
 * kbar 検索用のインデックス。
 *
 * Next 版では contentlayer.config.ts の createSearchIndex が
 * public/search.json を書き出していた（allCoreContent(sortPosts(allBlogs))）。
 * Astro では静的エンドポイントとして生成する。
 *
 * SearchModal が参照するのは path / title / subtitle / date / tags / draft のみ
 * なので、本文を含む全フィールドを吐いていた Next 版より転送量が小さくなる。
 * draft は getSortedPosts が本番ビルドで既に落としているが、Next 版の
 * フィルタ（post.draft !== true）と噛み合うようキーは残す。
 */
export const GET: APIRoute = async () => {
  const posts = await getSortedPosts()
  const docs = posts.map((post) => ({
    path: postPath(post),
    title: post.data.title,
    subtitle: post.data.subtitle ?? undefined,
    date: post.data.date.toISOString(),
    tags: post.data.tags ?? [],
    draft: post.data.draft ?? false,
  }))
  return new Response(JSON.stringify(docs), {
    headers: { 'Content-Type': 'application/json' },
  })
}
