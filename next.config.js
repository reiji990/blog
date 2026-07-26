const { withContentlayer } = require('next-contentlayer2')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// セキュリティヘッダ (CSP 等) と 301 リダイレクトは public/_headers と
// public/_redirects に移管済み。output:'export' では next.config の headers()/redirects()
// は警告も出さずに無視されるため、ここに書くと動かない定義が残るだけになる。
const output = process.env.EXPORT ? 'export' : undefined
const basePath = process.env.BASE_PATH || undefined
// output:'export' では next/image の最適化エンドポイントが存在しないため
// unoptimized が必須。EXPORT だけ指定して UNOPTIMIZED を忘れるとビルドが落ちるので連動させる
const unoptimized = process.env.UNOPTIMIZED || process.env.EXPORT ? true : undefined

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), {
    output,
    basePath,
    reactStrictMode: true,
    trailingSlash: false,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    turbopack: {},
    experimental: {
      // CSS を <style> として HTML にインライン化し、レンダリングブロックと
      // クリティカルチェーン(CSS 5ファイル分)を解消する。トレードオフとして
      // HTML は太り再訪時の CSS キャッシュは効かなくなるが、検索流入中心の
      // ブログでは初回表示の最適化を優先する
      inlineCss: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
        },
        {
          protocol: 'https',
          hostname: 'cdn-ak.f.st-hatena.com',
        },
      ],
      unoptimized,
    },
  })
}
