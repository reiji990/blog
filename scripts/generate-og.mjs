// frontmatter に images の無い記事の OG 画像 (1200x630) をビルド時に生成する。
// #111113 地に Shippori Mincho で記事表題+シリーズ名+「調和と変革」を組み、
// public/static/og/<slug>.png に出力する。
// フォントは scripts/fonts/ShipporiMincho-SemiBold.ttf（SIL OFL 1.1, Google Fonts より取得）
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const root = process.cwd()
const blogDir = path.join(root, 'data/blog')
const outDir = path.join(root, 'public/static/og')

const SITE_NAME = '調和と変革'
const COLORS = {
  bg: '#111113',
  text: '#d8d5cf',
  textStrong: '#ece9e2',
  muted: '#9a968e',
  border: '#2a2a2e',
}

const el = (type, style, children) => ({ type, props: { style, children } })

function titleFontSize(title) {
  if (title.length > 40) return 44
  if (title.length > 24) return 52
  return 60
}

function ogTree({ title, subtitle, series }) {
  const headerChildren = []
  if (series) {
    headerChildren.push(
      el('div', { fontSize: 28, color: COLORS.muted, marginBottom: 28 }, series)
    )
  }
  headerChildren.push(
    el(
      'div',
      {
        fontSize: titleFontSize(title),
        color: COLORS.textStrong,
        lineHeight: 1.45,
        letterSpacing: '0.02em',
      },
      title
    )
  )
  if (subtitle) {
    headerChildren.push(
      el(
        'div',
        { fontSize: 36, color: COLORS.text, lineHeight: 1.5, marginTop: 20 },
        subtitle
      )
    )
  }

  return el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: COLORS.bg,
      padding: 72,
      fontFamily: 'Shippori Mincho',
    },
    [
      el('div', { display: 'flex', flexDirection: 'column' }, headerChildren),
      el(
        'div',
        {
          display: 'flex',
          borderTop: `1px solid ${COLORS.border}`,
          paddingTop: 28,
          fontSize: 30,
          color: COLORS.muted,
        },
        SITE_NAME
      ),
    ]
  )
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true })
  const fontData = fs.readFileSync(path.join(root, 'scripts/fonts/ShipporiMincho-SemiBold.ttf'))
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx'))
  let generated = 0

  for (const file of files) {
    const { data } = matter(fs.readFileSync(path.join(blogDir, file), 'utf8'))
    if (data.images && data.images.length > 0) continue

    const slug = file.replace(/\.mdx$/, '')
    const svg = await satori(
      ogTree({ title: String(data.title ?? slug), subtitle: data.subtitle, series: data.series }),
      {
        width: 1200,
        height: 630,
        fonts: [{ name: 'Shippori Mincho', data: fontData, weight: 600, style: 'normal' }],
      }
    )
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
    fs.writeFileSync(path.join(outDir, `${slug}.png`), png)
    generated++
    console.log(`og: ${slug}.png`)
  }
  console.log(`OG images generated: ${generated}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
