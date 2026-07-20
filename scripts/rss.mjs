import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { slug } from 'github-slugger'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { escape } from 'pliny/utils/htmlEscaper.js'
import siteMetadata from '../data/siteMetadata.js'
import tagData from '../app/tag-data.json' with { type: 'json' }
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import { sortPosts } from 'pliny/utils/contentlayer.js'
import { excerpt } from './lib/plain-text.mjs'

const outputFolder = process.env.EXPORT ? 'out' : 'public'

// MDX 本文 (markdown 記法 + 素通りする HTML/JSX タグ) を HTML 文字列に変換する。
// MDX 独自コンポーネントのタグ自体は解決できずソースのまま残るが、
// content:encoded に verbatim で載せる分には許容する。
const markdownToHtmlProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })

function bodyToHtml(raw, siteUrl) {
  const html = String(markdownToHtmlProcessor.processSync(raw))
  return (
    html
      // 相対リンク・画像を絶対URL化する (プロトコル相対の `//` は対象外)
      .replace(/href="\/(?!\/)/g, `href="${siteUrl}/`)
      .replace(/src="\/(?!\/)/g, `src="${siteUrl}/`)
      // CDATA 終端記号は CDATA 内に出現できないためエスケープする
      .replace(/]]>/g, ']]]]><![CDATA[>')
  )
}

// summary が無い記事でも `undefined` を出力しないよう、本文からの抜粋にフォールバックする
function getDescription(post) {
  const text = post.summary ? post.summary : excerpt(post.body.raw, 140, { ellipsis: true })
  return escape(text)
}

const generateRssItem = (config, post) => `
  <item>
    <guid>${config.siteUrl}/blog/${post.slug}</guid>
    <title>${escape(post.title)}</title>
    <link>${config.siteUrl}/blog/${post.slug}</link>
    <description>${getDescription(post)}</description>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${config.email} (${config.author})</author>
    ${(post.tags || []).map((t) => `<category>${t}</category>`).join('')}
    <content:encoded><![CDATA[${bodyToHtml(post.body.raw, config.siteUrl)}]]></content:encoded>
  </item>
`

const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${config.siteUrl}/blog</link>
      <description>${escape(config.description)}</description>
      <language>${config.language}</language>
      <managingEditor>${config.email} (${config.author})</managingEditor>
      <webMaster>${config.email} (${config.author})</webMaster>
      <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`

async function generateRSS(config, allBlogs, page = 'feed.xml') {
  const publishPosts = allBlogs.filter((post) => post.draft !== true)
  // RSS for blog post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts))
    writeFileSync(`./${outputFolder}/${page}`, rss)
  }

  if (publishPosts.length > 0) {
    for (const tag of Object.keys(tagData)) {
      const filteredPosts = publishPosts.filter((post) =>
        post.tags.map((t) => slug(t)).includes(tag)
      )
      if (filteredPosts.length === 0) continue
      const rss = generateRss(config, sortPosts(filteredPosts), `tags/${tag}/${page}`)
      const rssPath = path.join(outputFolder, 'tags', tag)
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, page), rss)
    }
  }
}

const rss = () => {
  generateRSS(siteMetadata, allBlogs)
  console.log('RSS feed generated...')
}
export default rss
