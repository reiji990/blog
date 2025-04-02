import { ReactNode } from 'react'
import Image from '@/components/Image'
import Bleed from 'pliny/ui/Bleed'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import PageSubTitle from '@/components/PageSubTitle'
import SectionContainer from '@/components/SectionContainer'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import Share from '@/components/Share'

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

interface LayoutProps {
  content: CoreContent<Blog>
  children: ReactNode
  next?: { path: string; title: string; subtitle: string; draft: boolean }
  prev?: { path: string; title: string; subtitle: string; draft: boolean }
}

export default function PostMinimal({ content, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, subtitle, tags, lastmod, images, summary } = content
  const displayImage =
    images && images.length > 0 ? images[0] : 'https://picsum.photos/seed/picsum/800/400'
  const basePath = path.split('/')[0]
  const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`
  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div>
          <div className="space-y-1 pb-10 text-center dark:border-gray-700">
            <div className="w-full">
              <Bleed>
                <div className="relative aspect-2/1 w-full">
                  <Image src={displayImage} alt={title} fill className="object-cover" />
                </div>
              </Bleed>
              <div>
                <dd className="pt-6 text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                  <time dateTime={date}>
                    {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                  </time>
                  {lastmod && (
                    <div>
                      {'最終更新日: '}
                      {new Date(lastmod).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                    </div>
                  )}
                </dd>
              </div>
            </div>
            <div className="relative pt-10">
              <PageTitle>{title}</PageTitle>
              <PageSubTitle>{subtitle}</PageSubTitle>
            </div>
            <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
              {summary}
            </dd>
          </div>
          <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0 dark:divide-gray-700">
            <div className="prose dark:prose-invert max-w-none py-4">{children}</div>
            <div className="pt-6 pb-6 text-center text-sm text-gray-700 dark:text-gray-300">
              <Link href={editUrl(filePath)}>View on GitHub</Link>
              <Share title={title} subtitle={subtitle} slug={slug} summary={summary} />
            </div>
            {siteMetadata.comments && (
              <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300" id="comment">
                <Comments slug={slug} />
              </div>
            )}
            <div className="justify-between py-4 xl:block">
              <Link
                href={`/${basePath}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                aria-label="Back to the blog"
              >
                &larr; Back to the blog
              </Link>
            </div>
            <footer>
              <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
                {(next || prev) && (
                  <div className="justify-between py-4 xl:block">
                    {prev && prev.draft === false && (
                      <div>
                        <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          Previous Article
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/${prev.path}`}>
                            {prev.title} {prev.subtitle}
                          </Link>
                        </div>
                      </div>
                    )}
                    {next && next.draft === false && (
                      <div className="justify-between py-4 xl:block">
                        <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          Next Article
                        </h2>
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
              <div className="divide-gray-200 text-sm leading-5 font-medium xl:col-start-1 xl:row-start-2 xl:divide-y dark:divide-gray-700">
                {tags && (
                  <div className="py-4 xl:py-8">
                    <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      Tags
                    </h2>
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
