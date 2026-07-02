import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'
import seriesData from '@/data/series.json'

interface SeriesEntry {
  name: string
  slug: string
  description: string
}

const allSeries = seriesData as SeriesEntry[]

export const metadata = genPageMetadata({ title: 'シリーズ' })

export default async function SeriesIndexPage() {
  const posts = allCoreContent(sortPosts(allBlogs))

  return (
    <div className="divide-border divide-y">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-fg-strong text-3xl leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
          シリーズ
        </h1>
      </div>
      <div className="space-y-4 py-8">
        {allSeries.map((series) => {
          const count = posts.filter((post) => post.series === series.name).length
          return (
            <Link
              key={series.slug}
              href={`/series/${series.slug}`}
              className="border-border hover:border-accent block rounded-lg border p-5 transition-colors"
            >
              <p className="text-fg-strong [font-feature-settings:'palt'] text-xl">
                {series.name}（全{count}回）
              </p>
              {series.description && (
                <p className="text-muted pt-2 text-sm leading-6">{series.description}</p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
