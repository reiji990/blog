import PostPreview from './post-preview'
import type Post from '../interfaces/post'

type Props = {
  posts: Post[]
}

const MoreStories = ({ posts }: Props) => {
  return (
    <section className="max-w-4xl align-center mx-auto">
      <h3 className="mb-8 text-5xl md:text-5xl font-bold tracking-tighter leading-tight">
        Articles
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16 pd-32">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </section>
  )
}

export default MoreStories
