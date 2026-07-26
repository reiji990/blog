import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import { slug } from 'github-slugger'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'
import seriesData from '@/data/series.json'

export const dynamic = 'force-static'

interface SeriesEntry {
  name: string
  slug: string
  description: string
}

// 記事一覧から、指定日付フィールドの最新値 (YYYY-MM-DD) を求める。
// 該当記事が無い場合は今日の日付にフォールバックする。
function latestDate(posts: { date: string; lastmod?: string | null }[]): string {
  if (posts.length === 0) return new Date().toISOString().split('T')[0]
  const latestMs = Math.max(...posts.map((post) => new Date(post.lastmod || post.date).getTime()))
  return new Date(latestMs).toISOString().split('T')[0]
}

// サイトマップに載せる URL はパーセントエンコードした最終形でなければならない。
// タグ名は日本語がそのまま slug になるため、素で出すと配信側が
// エンコード済み URL へ 307 リダイレクトし、Search Console で
// 「リダイレクトあり」として弾かれる。Next.js の Metadata API は canonical を
// 自動でエンコードするので、そちらと表記を揃える意味もある。
//
// encodeURI と encodeURIComponent の使い分け:
//   - パス全体 (例 "blog/watanare02") は区切りの / を保持したいので encodeURI
//   - 単一セグメント (タグ名・シリーズ slug) は encodeURIComponent
const encodePath = (path: string) => encodeURI(path)
const encodeSegment = (segment: string) => encodeURIComponent(segment)

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl
  const today = new Date().toISOString().split('T')[0]
  const publishedBlogs = allBlogs.filter((post) => !post.draft)

  const blogRoutes = publishedBlogs.map((post) => ({
    url: `${siteUrl}/${encodePath(post.path)}`,
    lastModified: post.lastmod || post.date,
  }))

  const routes = ['', 'blog', 'projects', 'tags', 'about', 'series'].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: today,
  }))

  const tagRoutes = Object.keys(tagData as Record<string, number>).map((tag) => {
    const posts = publishedBlogs.filter((post) => post.tags?.map((t) => slug(t)).includes(tag))
    return {
      url: `${siteUrl}/tags/${encodeSegment(tag)}`,
      lastModified: latestDate(posts),
    }
  })

  const seriesRoutes = (seriesData as SeriesEntry[]).map((series) => {
    const posts = publishedBlogs.filter((post) => post.series === series.name)
    return {
      url: `${siteUrl}/series/${encodeSegment(series.slug)}`,
      lastModified: latestDate(posts),
    }
  })

  return [...routes, ...blogRoutes, ...tagRoutes, ...seriesRoutes]
}
