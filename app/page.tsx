import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import JsonLd from '@/components/JsonLd'
import Main from './Main'

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteMetadata.title,
    url: siteMetadata.siteUrl,
    description: siteMetadata.description,
    inLanguage: 'ja',
    author: {
      '@type': 'Person',
      name: siteMetadata.author,
      url: `${siteMetadata.siteUrl}/about`,
    },
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Main posts={posts} />
    </>
  )
}
