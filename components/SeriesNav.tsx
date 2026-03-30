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
    <div className="my-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <p className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        シリーズ：{series}
      </p>
      <ol className="space-y-1">
        {sorted.map((post, i) => (
          <li key={post.path} className="flex items-baseline gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{i + 1}.</span>
            {post.path === currentPath ? (
              <span className="font-semibold text-gray-900 dark:text-gray-100">{post.title}</span>
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
