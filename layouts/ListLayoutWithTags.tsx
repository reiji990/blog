'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import formatYMD from '@/components/formatYMD'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import tagData from 'app/tag-data.json'
import Image from '@/components/Image'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  subtitle: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/page\/\d+\/?$/, '') // Remove any trailing /page
    .replace(/\/$/, '') // Remove trailing slash
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            前のページ
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            前のページ
          </Link>
        )}
        <span>
          {currentPage} / {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            次のページ
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            次のページ
          </Link>
        )}
      </nav>
    </div>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  subtitle,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      <div>
        <div className="pt-6 pb-6">
          <h1 className="text-fg-strong text-3xl leading-9 tracking-tight sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
            <br />
            {subtitle}
          </h1>
        </div>
        <div className="flex sm:space-x-24">
          <div className="border-border hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded-sm border pt-5 sm:flex">
            <div className="px-6 py-4">
              {pathname.startsWith('/blog') ? (
                <h3 className="text-primary-500 uppercase">記事一覧</h3>
              ) : (
                <Link
                  href={`/blog`}
                  className="hover:text-primary-500 dark:hover:text-primary-500 text-fg uppercase"
                >
                  記事一覧
                </Link>
              )}
              <ul>
                {sortedTags.map((t) => {
                  return (
                    <li key={t} className="my-3">
                      {decodeURI(pathname.split('/tags/')[1]) === slug(t) ? (
                        <h3 className="text-primary-500 x-3 inline py-2 text-sm uppercase">
                          {`${t} (${tagCounts[t]})`}
                        </h3>
                      ) : (
                        <Link
                          href={`/tags/${slug(t)}`}
                          className="hover:text-primary-500 dark:hover:text-primary-500 text-muted px-3 py-2 text-sm font-medium uppercase"
                          aria-label={`View posts tagged ${t}`}
                        >
                          {`${t} (${tagCounts[t]})`}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          <div>
            <ul>
              {displayPosts.map((post, index) => {
                const { path, slug, date, lastmod, title, subtitle, summary, images, tags } = post
                // images の無い記事は生成OG画像にフォールバック
                const displayImage =
                  images && images.length > 0 ? images[0] : `/static/og/${slug}.png`
                return (
                  <li key={path} className="py-5">
                    <article className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
                      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg shadow xl:col-span-2">
                        <Link href={`/${path}`}>
                          <Image
                            src={displayImage}
                            alt={title}
                            fill
                            priority={index === 0}
                            fetchPriority={index === 0 ? 'high' : undefined}
                            sizes="(min-width: 1280px) 40vw, 100vw"
                            className="object-cover object-center transition-opacity hover:opacity-80"
                          />
                        </Link>
                      </div>
                      <div className="space-y-2 xl:col-span-3">
                        <dl>
                          <dt className="sr-only">公開日</dt>
                          <dd className="text-muted text-base leading-6 font-medium">
                            公開:{' '}
                            <time dateTime={date} suppressHydrationWarning>
                              {formatYMD(date)}
                            </time>
                            {lastmod && (
                              <div>
                                最終更新: <time dateTime={lastmod}>{formatYMD(lastmod)}</time>
                              </div>
                            )}
                          </dd>
                        </dl>
                        <h2 className="text-2xl leading-8 tracking-tight">
                          <Link
                            href={`/${path}`}
                            className="text-fg-strong hover:text-accent transition-colors"
                          >
                            {title}
                            <br />
                            {subtitle}
                          </Link>
                        </h2>
                        <div className="flex flex-wrap">
                          {tags?.map((tag) => (
                            <Tag key={tag} text={tag} />
                          ))}
                        </div>
                        <div className="prose text-muted max-w-none">{summary}</div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
