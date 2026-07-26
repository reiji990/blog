/**
 * このビルドを検索索引から除外するか。
 *
 * dev 用 Worker (blog-dev) は本番とまったく同じ内容を配信するため、素のままだと
 * ブログ全体が重複コンテンツとして索引される。Cloudflare の Build command を
 * `NOINDEX=1 yarn build` にすることで、robots.txt が Disallow: / を返し、
 * 全ページに noindex,nofollow の meta が入る。
 *
 * ビルド時にしか参照しない（.astro の frontmatter / エンドポイント）ので
 * process.env で足りる。PUBLIC_ 接頭辞は不要。
 */
export const isNoindexBuild = process.env.NOINDEX === '1'
