import type { APIRoute } from 'astro'
import siteMetadata from '@/data/siteMetadata.mjs'

// app/robots.ts の移植
export const GET: APIRoute = () =>
  new Response(
    `User-Agent: *\nAllow: /\n\nHost: ${siteMetadata.siteUrl}\nSitemap: ${siteMetadata.siteUrl}/sitemap.xml\n`,
    { headers: { 'Content-Type': 'text/plain' } }
  )
