// ビルド後スクリプト（rss.mjs / llms.mjs）向けの記事データ源。
//
// 従来は contentlayer の生成物 (.contentlayer/generated) と pliny の
// sortPosts / tag-data.json に依存していたが、Astro 移行でどちらも無くなるため
// data/blog の MDX を直接読む。generate-og.mjs が既に同じ方式を採っており、
// ビルド順（Astro のビルド完了後に走る）にも依存しない。
//
// 返すオブジェクトは従来 contentlayer が渡していた形に合わせてある
// （title / date / lastmod / draft / summary / tags / slug / path / body.raw）。

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { slug as slugify } from 'github-slugger'

const BLOG_DIR = path.join(process.cwd(), 'data', 'blog')

/** data/blog 配下の .mdx を再帰的に列挙する */
function listMdx(dir, base = dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) {
      out.push(...listMdx(full, base))
    } else if (name.endsWith('.mdx')) {
      out.push(full)
    }
  }
  return out
}

/**
 * 全記事を読み込む。
 * slug はファイル名そのまま（大文字小文字を保つ）。Astro の content.config.ts の
 * generateId と揃えないと URL がずれるため、ここでも slugify しない。
 */
export function getAllPosts() {
  return listMdx(BLOG_DIR).map((file) => {
    const raw = readFileSync(file, 'utf8')
    const { data, content } = matter(raw)
    const rel = path.relative(BLOG_DIR, file).replace(/\.mdx$/, '')
    return {
      ...data,
      slug: rel,
      path: `blog/${rel}`,
      body: { raw: content },
    }
  })
}

/** pliny/utils/contentlayer の sortPosts 相当（日付の降順） */
export function sortPosts(posts) {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/** 公開記事のみ */
export function publishedPosts(posts) {
  return posts.filter((post) => post.draft !== true)
}

/**
 * contentlayer.config.ts の createTagCount 相当。
 * 従来 app/tag-data.json に書き出していたものをその場で数える。
 */
export function getTagCounts(posts) {
  const counts = {}
  for (const post of publishedPosts(posts)) {
    for (const tag of post.tags ?? []) {
      const key = slugify(tag)
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return counts
}

/** pliny/utils/htmlEscaper の escape 相当 */
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }
export function escape(value) {
  return String(value).replace(/[&<>'"]/g, (m) => ESCAPES[m])
}
