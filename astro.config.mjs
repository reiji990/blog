import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// --- contentlayer.config.ts と同一のプラグイン列 ---------------------------
// PoC (blog-astro-poc) で Next 版と本文 HTML がトークン単位で一致することを
// 確認済み。順序を変えると出力が変わるので Next 版の並びを維持する。
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { remarkAlert } from 'remark-github-blockquote-alert'
import remarkLinkCard from 'remark-link-card-plus'
import remarkCodeTitles from './scripts/remark-code-titles.mjs'
import remarkFirstImageEager from './scripts/remark-first-image-eager.mjs'
import remarkRenameLayout from './scripts/remark-rename-layout.mjs'
import rehypeLinkcardLazy from './scripts/rehype-linkcard-lazy.mjs'

import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeKatexNoTranslate from 'rehype-katex-notranslate'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'

import siteMetadata from './data/siteMetadata.mjs'

const root = process.cwd()

// Next 版と同一の heroicon mini link（className のままにして出力差分を作らない）
const icon = fromHtmlIsomorphic(
  `
  <span class="content-header-link">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 linkicon">
  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
  <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
  </svg>
  </span>
`,
  { fragment: true }
)

export default defineConfig({
  site: siteMetadata.siteUrl,
  trailingSlash: 'never',
  // リンクの事前読み込み。viewport 戦略は「画面内に入ったリンクを先読み」で、
  // Next.js の <Link> の既定挙動に相当する（hover はモバイルで効かないため不採用）。
  // 全ページ静的 HTML なので先読み対象は数十 KB の HTML のみ。
  // 実際のページ切り替えは BaseLayout の <ClientRouter /> が差分スワップで行う
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  integrations: [mdx(), react()],
  vite: {
    plugins: [tailwindcss()],
    // Vite 既定の 'modules' (chrome87/edge88/es2020/firefox78/safari14) では
    // esbuild が @astrojs/react の分割代入を変換できずビルドが落ちる。
    // package.json の browserslist (chrome>=93, safari>=15.4 等) に合わせる。
    // build だけでなく依存の事前バンドル (optimizeDeps) 側にも指定しないと
    // node_modules の変換で同じエラーになる
    build: { target: ['chrome93', 'edge93', 'firefox92', 'safari15.4'] },
    esbuild: { target: 'es2022' },
    optimizeDeps: { esbuildOptions: { target: 'es2022' } },
    // react-tweet は CSS Modules を同梱しており、SSR 時に Node が .css を
    // 直接読もうとして落ちる。Vite にバンドルさせて解決する
    ssr: { noExternal: ['react-tweet'] },
  },
  markdown: {
    // Astro 既定の GFM / smartypants / shiki を切り、Next 版と同じ
    // プラグイン列だけで組む（二重適用と highlighter 差異を避ける）
    gfm: false,
    smartypants: false,
    syntaxHighlight: false,
    remarkPlugins: [
      // frontmatter の layout が Astro MDX の予約語と衝突するため退避する
      remarkRenameLayout,
      // remarkExtractFrontmatter … Astro が frontmatter を扱うため不要
      remarkGfm,
      remarkCodeTitles,
      remarkMath,
      // remarkImgToJsx … 画像は public/ 配信のままなので不要
      remarkFirstImageEager,
      remarkAlert,
      [
        remarkLinkCard,
        {
          cache: true,
          shortenUrl: true,
          thumbnailPosition: 'left',
          ogTransformer: (og, url) => {
            if (url.hostname.includes('amazon.')) {
              return { ...og, imageUrl: undefined }
            }
            return og
          },
        },
      ],
    ],
    rehypePlugins: [
      // rehypeRaw … MDX は inline HTML を JSX として解釈するため不要。
      // PoC で <br> 29個 / <details> 4個が Next 版と完全一致することを確認済み
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          headingProperties: { className: ['content-header'] },
          content: icon,
        },
      ],
      rehypeKatex,
      rehypeKatexNoTranslate,
      [rehypeCitation, { path: path.join(root, 'data') }],
      [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
      rehypeLinkcardLazy,
      // rehype-preset-minify は preset ({plugins, settings}) で Astro の
      // config スキーマが受け付けないため plugins を展開する。settings
      // (stringifier オプション) は Astro が stringifier を握るため適用されない
      ...rehypePresetMinify.plugins,
    ],
  },
})
