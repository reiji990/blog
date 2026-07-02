import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import formatYMD from '@/components/formatYMD'
import Image from '@/components/Image'

const MAX_DISPLAY = 5

export default function Home({ posts }) {
  return (
    <>
      <div className="divide-border divide-y">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-fg-strong text-3xl leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            最新の記事
          </h1>
          <p className="text-muted text-lg leading-7">{siteMetadata.description}</p>
        </div>
        <ul className="divide-border divide-y">
          {!posts.length && '記事がありません。'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, lastmod, title, subtitle, summary, images, tags } = post
            // images の無い記事は生成OG画像にフォールバック
            const displayImage = images && images.length > 0 ? images[0] : `/static/og/${slug}.png`
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
                    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg shadow xl:col-span-2">
                      <Link href={`/blog/${slug}`}>
                        <Image src={displayImage} alt={title} fill className="object-cover" />
                      </Link>
                    </div>
                    <div className="space-y-2 xl:col-span-3">
                      <dl>
                        <dt className="sr-only">公開日</dt>
                        <dd className="text-muted text-base leading-6 font-medium">
                          公開: <time dateTime={date}>{formatYMD(date)}</time>
                          {lastmod && (
                            <div>
                              最終更新: <time dateTime={lastmod}>{formatYMD(lastmod)}</time>
                            </div>
                          )}
                        </dd>
                      </dl>
                      <h2 className="text-2xl leading-8 tracking-tight">
                        <Link href={`/blog/${slug}`} className="text-fg-strong">
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
                      <div className="prose text-muted max-w-none">{summary}</div>
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
