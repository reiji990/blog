import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import formatYMD from '@/components/formatYMD'
import Image from '@/components/Image'

const MAX_DISPLAY = 5

export default function Home({ posts }) {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            最新の記事
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {siteMetadata.description}
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && '記事がありません。'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, lastmod, title, subtitle, summary, images, tags } = post
            const displayImage = images && images.length > 0 ? images[0] : null
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
                    {displayImage && (
                      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg shadow xl:col-span-2">
                        <Link href={`/blog/${slug}`}>
                          <Image src={displayImage} alt={title} fill className="object-cover" />
                        </Link>
                      </div>
                    )}
                    <div
                      className={`space-y-2 ${displayImage ? 'xl:col-span-3' : 'xl:col-span-5'}`}
                    >
                      <dl>
                        <dt className="sr-only">公開日</dt>
                        <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                          公開: <time dateTime={date}>{formatYMD(date)}</time>
                          {lastmod && (
                            <div>
                              最終更新: <time dateTime={lastmod}>{formatYMD(lastmod)}</time>
                            </div>
                          )}
                        </dd>
                      </dl>
                      <h2 className="text-2xl leading-8 tracking-tight">
                        <Link href={`/blog/${slug}`} className="text-gray-900 dark:text-gray-100">
                          {title}
                          <br />
                          {subtitle}
                        </Link>
                      </h2>
                      <div className="flex flex-wrap">
                        {tags.map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                      </div>
                      <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                        {summary}
                      </div>
                      <div className="text-base leading-6 font-medium">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`「${title} ${subtitle ?? ''}」を読む`}
                        >
                          続きを読む &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="記事一覧"
          >
            記事一覧 &rarr;
          </Link>
        </div>
      )}
    </>
  )
}
