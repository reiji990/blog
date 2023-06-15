import { MDXProvider } from '@mdx-js/react'
import { components } from './MDXComponents'
import PostContent from './PostContent'

export default function Post({ source }) {
  return (
    <MDXProvider components={components}>
      <PostContent source={source} />
    </MDXProvider>
  )
}
