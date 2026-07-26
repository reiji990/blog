import type { APIRoute } from 'astro'
import siteMetadata from '@/data/siteMetadata.mjs'
import { isNoindexBuild } from '@/lib/deploy'

// app/robots.ts の移植。
// dev 環境（NOINDEX=1）は本番と同一の内容を配信するため、丸ごとクロール拒否する。
// canonical は常に本番 URL を指しているので二重の保険になる。
export const GET: APIRoute = () => {
  const body = isNoindexBuild
    ? 'User-Agent: *\nDisallow: /\n'
    : `User-Agent: *\nAllow: /\n\nHost: ${siteMetadata.siteUrl}\nSitemap: ${siteMetadata.siteUrl}/sitemap.xml\n`
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } })
}
