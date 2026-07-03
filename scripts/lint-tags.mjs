// 全MDX記事の tags を data/tags-allowlist.json と照合し、未知タグがあれば非0で終了する
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const allowlist = new Set(
  JSON.parse(fs.readFileSync(path.join(root, 'data/tags-allowlist.json'), 'utf8'))
)
const blogDir = path.join(root, 'data/blog')

let errors = 0
for (const file of fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx'))) {
  const src = fs.readFileSync(path.join(blogDir, file), 'utf8')
  const fmMatch = src.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) {
    console.error(`${file}: frontmatter が見つかりません`)
    errors++
    continue
  }
  const tagsMatch = fmMatch[1].match(/^tags:\s*\[(.*)\]\s*$/m)
  if (!tagsMatch) {
    console.error(`${file}: tags 行が見つかりません`)
    errors++
    continue
  }
  const tags = tagsMatch[1]
    .split(',')
    .map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
  for (const tag of tags) {
    if (!allowlist.has(tag)) {
      console.error(`${file}: 未知のタグ '${tag}'`)
      errors++
    }
  }
}

if (errors) {
  console.error(`lint:content 失敗 (${errors} 件)`)
  process.exit(1)
}
console.log('lint:content OK: 全記事の tags が allowlist に含まれています')
