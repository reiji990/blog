import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// contentlayer.config.ts の Blog / Authors ドキュメント型に対応する定義。
//
// MDX は data/blog, data/authors に置いたまま glob loader で読む。
// src/content/ へ移動しないのは、20本の記事の git 履歴を保つためと、
// generate-og.mjs など data/blog を直接読むビルドスクリプトを無変更で
// 流用できるようにするため。
//
// contentlayer の computedFields との対応:
//   slug      → entry.id（base からの相対パスから拡張子を除いたもの）
//   path      → `blog/${entry.id}`（src/lib/content.ts の postPath）
//   filePath  → entry.filePath
//   toc       → render() が返す headings から導出（src/lib/toc.ts）
//   readingTime, structuredData → src/lib/content.ts で導出
/**
 * Astro の glob loader は既定でファイル名を slugify する（＝小文字化する）。
 * それだと公開済みの URL が 2 本壊れる:
 *   Converting-Python-files-to-exe → converting-python-files-to-exe
 *   music-player-using-python-VLC  → music-player-using-python-vlc
 * contentlayer はファイル名をそのまま slug にしていたので、同じ挙動にする。
 */
const idFromFilename = ({ entry }: { entry: string }) => entry.replace(/\.mdx$/, '')

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './data/blog', generateId: idFromFilename }),
  schema: z.object({
    title: z.string(),
    // frontmatter に `subtitle:` と書いて値が空の記事が4本ある。
    // contentlayer は null を通していたので zod 側も nullable にする
    subtitle: z.string().nullable().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    lastmod: z.coerce.date().nullable().optional(),
    draft: z.boolean().nullable().optional(),
    summary: z.string().nullable().optional(),
    images: z.union([z.string(), z.array(z.string())]).optional(),
    authors: z.array(z.string()).optional(),
    // remark-rename-layout.mjs が frontmatter の layout をここへ退避する。
    // Astro MDX は layout をレイアウトの import パスとして予約しているため
    layout: z.string().optional(),
    postLayout: z.string().optional(),
    bibliography: z.string().nullable().optional(),
    canonicalUrl: z.string().nullable().optional(),
    series: z.string().nullable().optional(),
    seriesOrder: z.number().nullable().optional(),
  }),
})

const authors = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './data/authors', generateId: idFromFilename }),
  schema: z.object({
    name: z.string(),
    avatar: z.string().optional(),
    occupation: z.string().optional(),
    company: z.string().optional(),
    email: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    layout: z.string().optional(),
    postLayout: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    mastodon: z.string().optional(),
    facebook: z.string().optional(),
    bluesky: z.string().optional(),
  }),
})

export const collections = { blog, authors }
