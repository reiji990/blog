import { writeFileSync } from 'fs'
import siteMetadata from '../data/siteMetadata.js'
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import { sortPosts } from 'pliny/utils/contentlayer.js'
import { excerpt } from './lib/plain-text.mjs'

const outputFolder = process.env.EXPORT ? 'out' : 'public'
const siteUrl = siteMetadata.siteUrl

// サイトの簡潔な説明。data/authors/default.mdx の本文 (著者による紹介文) を踏襲する。
const SITE_DESCRIPTION =
  'オタク系コンテンツの話と、習慣にしている（したい）勉強や読書の話を書いています。'

const formatDate = (date) => new Date(date).toISOString().split('T')[0]

// summary フロントマターが無い記事は本文冒頭からのプレーンテキスト抜粋を要約として使う
const postSummary = (post) => (post.summary ? post.summary : excerpt(post.body.raw, 100))

const siteHeader = () =>
  [`# ${siteMetadata.title}`, '', `> ${siteMetadata.description}`, '', SITE_DESCRIPTION].join('\n')

function generateLlmsTxt(posts) {
  const articleLines = posts.map((post) => {
    const url = `${siteUrl}/${post.path}`
    return `- [${post.title}](${url}): ${postSummary(post)} (${formatDate(post.date)})`
  })

  const otherLines = [
    `- [About](${siteUrl}/about)`,
    `- [タグ一覧](${siteUrl}/tags)`,
    `- [フィード](${siteUrl}/feed.xml)`,
    `- [llms-full.txt](${siteUrl}/llms-full.txt)`,
  ]

  return (
    [siteHeader(), '', '## 記事', '', ...articleLines, '', '## その他', '', ...otherLines].join(
      '\n'
    ) + '\n'
  )
}

function generateLlmsFullTxt(posts) {
  const articles = posts.map((post) => {
    const url = `${siteUrl}/${post.path}`
    const tags = (post.tags || []).join(', ')
    return [
      `# ${post.title}`,
      `URL: ${url}`,
      `日付: ${formatDate(post.date)}`,
      `タグ: ${tags}`,
      '',
      post.body.raw.trim(),
    ].join('\n')
  })

  return [siteHeader(), ...articles].join('\n\n---\n\n') + '\n'
}

async function llms() {
  const publishPosts = allBlogs.filter((post) => post.draft !== true)
  if (publishPosts.length === 0) return

  const posts = sortPosts(publishPosts)

  writeFileSync(`./${outputFolder}/llms.txt`, generateLlmsTxt(posts))
  writeFileSync(`./${outputFolder}/llms-full.txt`, generateLlmsFullTxt(posts))
  console.log('llms.txt / llms-full.txt generated...')
}

export default llms
