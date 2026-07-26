import type { APIRoute } from 'astro'
import siteMetadata from '@/data/siteMetadata.mjs'
import { getSortedPosts, postPath } from '@/lib/content'
import { getTagCounts } from '@/lib/tags'
import seriesData from '@/data/series.json'

/**
 * app/sitemap.ts の移植。
 *
 * URL はパーセントエンコードした最終形で出す。日本語タグを素で載せると
 * 配信側がエンコード済み URL へリダイレクトし、Search Console で
 * 「リダイレクトあり」として弾かれるため（Next 版で実際に起きて修正済み）。
 *   - パス全体は区切りの / を保持したいので encodeURI
 *   - 単一セグメント（タグ名・シリーズ slug）は encodeURIComponent
 */
const encodePath = (p: string) => encodeURI(p)
const encodeSegment = (s: string) => encodeURIComponent(s)

function ymd(date: Date) {
  return date.toISOString().split('T')[0]
}

/** 該当記事のうち最も新しい更新日。無ければ今日 */
function latestDate(dates: Date[]) {
  if (dates.length === 0) return ymd(new Date())
  return ymd(new Date(Math.max(...dates.map((d) => d.getTime()))))
}

export const GET: APIRoute = async () => {
  const siteUrl = siteMetadata.siteUrl
  const today = ymd(new Date())
  const posts = await getSortedPosts()

  const entries: { url: string; lastmod: string }[] = []

  for (const route of ['', 'blog', 'projects', 'tags', 'about', 'series']) {
    entries.push({ url: `${siteUrl}/${route}`, lastmod: today })
  }
  for (const post of posts) {
    entries.push({
      url: `${siteUrl}/${encodePath(postPath(post))}`,
      lastmod: ymd(post.data.lastmod ?? post.data.date),
    })
  }
  const counts = await getTagCounts()
  const { slug } = await import('github-slugger')
  for (const tag of Object.keys(counts)) {
    const tagged = posts.filter((p) => (p.data.tags ?? []).map((t) => slug(t)).includes(tag))
    entries.push({
      url: `${siteUrl}/tags/${encodeSegment(tag)}`,
      lastmod: latestDate(tagged.map((p) => p.data.lastmod ?? p.data.date)),
    })
  }
  for (const series of seriesData as { name: string; slug: string }[]) {
    const inSeries = posts.filter((p) => p.data.series === series.name)
    entries.push({
      url: `${siteUrl}/series/${encodeSegment(series.slug)}`,
      lastmod: latestDate(inSeries.map((p) => p.data.lastmod ?? p.data.date)),
    })
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map((e) => `<url>\n<loc>${e.url}</loc>\n<lastmod>${e.lastmod}</lastmod>\n</url>`)
      .join('\n') +
    `\n</urlset>\n`

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } })
}
