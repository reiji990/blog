import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from '@/components/Link'
import formatYMD from '@/components/formatYMD'
import { genPageMetadata } from 'app/seo'
import seriesData from '@/data/series.json'

interface SeriesEntry {
  name: string
  slug: string
  description: string
}

const allSeries = seriesData as SeriesEntry[]

export const generateStaticParams = async () => {
  return allSeries.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const series = allSeries.find((s) => s.slug === params.slug)
  if (!series) {
    return
  }
  return genPageMetadata({ title: series.name, description: series.description || undefined })
}

export default async function SeriesPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const series = allSeries.find((s) => s.slug === params.slug)
  if (!series) {
    return notFound()
  }

  const posts = allCoreContent(sortPosts(allBlogs))
    .filter((p) => p.series === series.name)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))

  return (
    <div className="divide-border divide-y">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <p className="text-muted text-sm tracking-wide uppercase">シリーズ</p>
        <h1 className="font-heading text-fg-strong [font-feature-settings:'palt'] text-3xl leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
          {series.name}
        </h1>
        <p className="text-muted text-lg leading-7">全{posts.length}回</p>
        {/* TODO: 著者が記入 — 非読者向けの前提要約をここに置く（data/series.json の description） */}
        {series.description && <p className="text-fg text-base leading-7">{series.description}</p>}
      </div>
      <ol className="divide-border divide-y">
        {posts.map((post, i) => (
          <li key={post.path} className="py-6">
            <article className="space-y-2">
              <p className="text-muted text-sm">
                第{post.seriesOrder ?? i + 1}回 ・ 公開:{' '}
                <time dateTime={post.date}>{formatYMD(post.date)}</time>
              </p>
              <h2 className="text-xl leading-8 tracking-tight">
                <Link href={`/${post.path}`} className="text-fg-strong">
                  {post.title}
                  {post.subtitle && (
                    <>
                      <br />
                      {post.subtitle}
                    </>
                  )}
                </Link>
              </h2>
              {post.summary && <p className="text-muted text-base leading-7">{post.summary}</p>}
            </article>
          </li>
        ))}
      </ol>
    </div>
  )
}
