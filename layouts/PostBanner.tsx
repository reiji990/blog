import { ReactNode } from 'react'
import Image from '@/components/Image'
import Bleed from 'pliny/ui/Bleed'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import PageSubTitle from '@/components/PageSubTitle'
import SectionContainer from '@/components/SectionContainer'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import Share from '@/components/Share'
import SeriesNav from '@/components/SeriesNav'
import formatYMD from '@/components/formatYMD'

interface SeriesPost {
  path: string
  title: string
  seriesOrder?: number | null
}

interface LayoutProps {
  content: CoreContent<Blog>
  children: ReactNode
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string; subtitle: string; draft: boolean }
  prev?: { path: string; title: string; subtitle: string; draft: boolean }
  seriesPosts?: SeriesPost[]
}

export default function PostLayout({
  content,
  authorDetails,
  next,
  prev,
  children,
  seriesPosts = [],
}: LayoutProps) {
  const { filePath, path, slug, date, title, subtitle, tags, lastmod, images, summary, series } =
    content
  const displayImage =
    images && images.length > 0 ? images[0] : 'https://picsum.photos/seed/picsum/800/400'
  const basePath = path.split('/')[0]
  const editUrl = (path: string) => `${siteMetadata.siteRepo}/blob/main/data/${path}`
  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-border xl:divide-y">
          <Bleed>
            <div className="w-full">
              <Image
                src={displayImage}
                alt={title}
                width={1600}
                height={900}
                className="h-auto w-full"
              />
            </div>
          </Bleed>
          <header className="pt-6 xl:pb-6">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">公開日</dt>
                  <dd className="text-muted text-base leading-6 font-medium">
                    公開: <time dateTime={date}>{formatYMD(date)}</time>
                    {lastmod && (
                      <div>
                        最終更新: <time dateTime={lastmod}>{formatYMD(lastmod)}</time>
                      </div>
                    )}
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
                <PageSubTitle>{subtitle}</PageSubTitle>
              </div>
              <dd className="text-muted text-base leading-6 font-medium">{summary}</dd>
            </div>
          </header>
          <div className="divide-border grid-rows-[auto_1fr] divide-y pb-8 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0">
            <dl className="xl:border-border pt-6 pb-10 xl:border-b xl:pt-11">
              <dt className="sr-only">Authors</dt>
              <dd>
                <ul className="flex flex-wrap justify-center gap-4 sm:space-x-12 xl:block xl:space-y-8 xl:space-x-0">
                  {authorDetails.map((author) => (
                    <li className="flex items-center space-x-2" key={author.name}>
                      {author.avatar && (
                        <Image
                          src={author.avatar}
                          width={38}
                          height={38}
                          alt="avatar"
                          className="h-10 w-10 rounded-full"
                        />
                      )}
                      <dl className="text-sm leading-5 font-medium whitespace-nowrap">
                        <dt className="sr-only">Name</dt>
                        <dt className="sr-only">Twitter</dt>
                        <dd>
                          {
                            <Link
                              href="/about"
                              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              {author.name}
                            </Link>
                          }
                        </dd>
                      </dl>
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
            <div className="divide-border divide-y xl:col-span-3 xl:row-span-2 xl:pb-0">
              {series && seriesPosts.length > 1 && (
                <SeriesNav series={series} currentPath={path} posts={seriesPosts} />
              )}
              <div className="prose dark:prose-invert mx-auto w-full pt-10 pb-8">{children}</div>
              <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 pt-6 pb-6 text-center">
                <Link href={editUrl(filePath)}>記事のソースと変更履歴（GitHub）</Link>
              </div>
              <Share title={title} subtitle={subtitle} slug={slug} summary={summary} />
              {siteMetadata.comments && (
                <div className="text-fg pt-6 pb-6 text-center" id="comment">
                  <Comments slug={slug} />
                </div>
              )}
              <div className="justify-between py-4 xl:block">
                <Link
                  href={`/${basePath}`}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="記事一覧へ戻る"
                >
                  &larr; 記事一覧へ戻る
                </Link>
              </div>
              {(next || prev) && (
                <div className="justify-between py-4 xl:block">
                  {prev && prev.draft === false && (
                    <div>
                      <h2 className="text-muted text-xs tracking-wide uppercase">前の記事</h2>
                      <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                        <Link href={`/${prev.path}`}>
                          {prev.title} {prev.subtitle}
                        </Link>
                      </div>
                    </div>
                  )}
                  {next && next.draft === false && (
                    <div className="justify-between py-4 xl:block">
                      <h2 className="text-muted text-xs tracking-wide uppercase">次の記事</h2>
                      <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                        <Link href={`/${next.path}`}>
                          {next.title} {next.subtitle}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <footer>
              <div className="divide-border text-sm leading-5 font-medium xl:col-start-1 xl:row-start-2 xl:divide-y">
                {tags && (
                  <div className="py-4 xl:py-8">
                    <h2 className="text-muted text-xs tracking-wide uppercase">タグ</h2>
                    <div className="flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
