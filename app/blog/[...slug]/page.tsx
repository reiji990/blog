import 'css/prism.css'
import 'katex/dist/katex.css'

import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts, coreContent, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors } from 'contentlayer/generated'
import type { Authors, Blog } from 'contentlayer/generated'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

// images の無い記事はビルド時に生成した OG 画像へフォールバックする。
// generateMetadata (OGP/Twitter Card) と JSON-LD (BlogPosting.image) の
// 両方で同じ絶対URL配列を使うためにここへ共通化する。
function resolvePostImages(post: Pick<Blog, 'slug' | 'images'>): {
  imageList: string[]
  imageUrls: string[]
} {
  const imageList: string[] = post.images
    ? typeof post.images === 'string'
      ? [post.images]
      : post.images
    : [`/static/og/${post.slug}.png`]
  const imageUrls = imageList.map((img) =>
    img && img.includes('http') ? img : new URL(img, siteMetadata.siteUrl).toString()
  )
  return { imageList, imageUrls }
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  const post = allBlogs.find((p) => p.slug === slug)
  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  if (!post) {
    return
  }

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = authorDetails.map((author) => author.name)
  const { imageList, imageUrls } = resolvePostImages(post)
  const ogImages = imageUrls.map((url) => ({ url }))

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'ja_JP',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

export const generateStaticParams = async () => {
  return allBlogs.map((p) => ({ slug: p.slug.split('/').map((name) => decodeURI(name)) }))
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  // Filter out drafts in production
  const sortedCoreContents = allCoreContent(sortPosts(allBlogs))
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug)
  if (postIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const post = allBlogs.find((p) => p.slug === slug) as Blog
  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults as Authors)
  })
  const mainContent = coreContent(post)
  const seriesPosts = post.series
    ? allCoreContent(allBlogs.filter((p) => p.series === post.series && p.draft !== true))
    : []
  const jsonLd = post.structuredData
  jsonLd['author'] = authorDetails.map((author) => {
    return {
      '@type': 'Person',
      name: author.name,
    }
  })
  // OGP/Twitter Card と同じ絶対URL配列を使い、画像なし記事の相対パスを解消する
  const { imageUrls } = resolvePostImages(post)
  jsonLd['image'] = imageUrls
  jsonLd['publisher'] = {
    '@type': 'Organization',
    name: siteMetadata.title,
    url: siteMetadata.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: new URL(siteMetadata.siteLogo, siteMetadata.siteUrl).toString(),
    },
  }

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteMetadata.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteMetadata.siteUrl}/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${siteMetadata.siteUrl}/${post.path}`,
      },
    ],
  }

  const Layout = layouts[post.layout || defaultLayout]

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbList} />
      <Layout
        content={mainContent}
        authorDetails={authorDetails}
        next={next}
        prev={prev}
        seriesPosts={seriesPosts}
      >
        <MDXLayoutRenderer code={post.body.code} components={components} toc={post.toc} />
      </Layout>
    </>
  )
}
