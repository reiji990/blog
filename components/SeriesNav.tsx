import Link from '@/components/Link'

interface SeriesPost {
  path: string
  title: string
  seriesOrder?: number | null
}

interface SeriesNavProps {
  series: string
  currentPath: string
  posts: SeriesPost[]
}

export default function SeriesNav({ series, currentPath, posts }: SeriesNavProps) {
  const sorted = [...posts].sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))

  return (
    <div className="border-border my-6 rounded-lg border p-4">
      <p className="text-muted mb-3 text-sm font-semibold tracking-wide uppercase">
        シリーズ：{series}
      </p>
      <ol className="space-y-1">
        {sorted.map((post, i) => (
          <li key={post.path} className="flex items-baseline gap-2 text-sm">
            <span className="text-muted">{i + 1}.</span>
            {post.path === currentPath ? (
              <span className="text-fg-strong font-semibold">{post.title}</span>
            ) : (
              <Link
                href={`/${post.path}`}
                className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {post.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
