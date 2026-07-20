import { Authors, allAuthors } from 'contentlayer/generated'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import siteMetadata from '@/data/siteMetadata'
import JsonLd from '@/components/JsonLd'

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'default') as Authors
  const mainContent = coreContent(author)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `${siteMetadata.siteUrl}/about`,
    ...(author.avatar ? { image: new URL(author.avatar, siteMetadata.siteUrl).toString() } : {}),
    sameAs: [
      siteMetadata.github,
      siteMetadata.twitter,
      siteMetadata.instagram,
      siteMetadata.youtube,
      siteMetadata.bluesky,
    ].filter((url) => Boolean(url)),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <AuthorLayout content={mainContent}>
        <MDXLayoutRenderer code={author.body.code} components={components} />
      </AuthorLayout>
    </>
  )
}
