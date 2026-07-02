'use client'

import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

type ShareProps = { title: string; subtitle: string | undefined; summary?: string; slug: string }

const CopyUrlButton = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // クリップボードが使えない環境では何もしない
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="URLをコピー"
      title="URLをコピー"
      className="hover:text-primary-500 dark:hover:text-primary-400 text-fg align-middle"
    >
      {copied ? (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
          <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
        </svg>
      )}
    </button>
  )
}

const Share = ({ title, subtitle, slug }: ShareProps) => {
  const fulltitle = subtitle ? `${title} ${subtitle}` : title
  const url = `${siteMetadata.siteUrl}blog/${slug}`

  return (
    <div className="m-4 mt-8 flex flex-col items-center justify-center pt-4 pb-4 sm:flex-row">
      <div className="mb-4 sm:mb-0">
        <p className="text-fg mr-3">共有:</p>
      </div>
      <div>
        <ul>
          <li className="inline-block">
            <SocialIcon
              kind="twitter"
              size={5}
              aria-label={'twittershare'}
              href={`https://x.com/intent/tweet?text=${fulltitle}%20%7C%20${siteMetadata.title}%20${url}%20@${siteMetadata.author}`}
            />
          </li>
          <li className="ml-4 inline-block">
            <SocialIcon
              kind="bluesky"
              size={5}
              aria-label={'blueskyshare'}
              href={`https://bsky.app/intent/compose?text=${fulltitle}%20%7C%20${siteMetadata.title}%20${url}%20@${siteMetadata.author}.blog`}
            />
          </li>
          <li className="ml-4 inline-block">
            <CopyUrlButton url={url} />
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Share
