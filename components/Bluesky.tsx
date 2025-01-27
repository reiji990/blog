'use client'

import { useEffect, useId, useState } from 'react'
import { usePathname } from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'

const WEBSITE_URL = siteMetadata.siteUrl
const EMBED_URL = 'https://embed.bsky.app'

export default function BlueskyPostEmbed({ uri }: { uri: string }) {
  const id = useId()
  const pathname = usePathname()
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const abortController = new AbortController()
    const { signal } = abortController
    window.addEventListener(
      'message',
      (event) => {
        if (event.origin !== EMBED_URL) {
          return
        }

        const iframeId = (event.data as { id: string }).id
        if (id !== iframeId) {
          return
        }

        const internalHeight = (event.data as { height: number }).height
        if (internalHeight && typeof internalHeight === 'number') {
          setHeight(internalHeight)
        }
      },
      { signal }
    )

    return () => {
      abortController.abort()
    }
  }, [id])

  const ref_url = WEBSITE_URL + pathname

  const searchParams = new URLSearchParams()
  searchParams.set('id', id)
  searchParams.set('ref_url', encodeURIComponent(ref_url))

  const src = `${EMBED_URL}/embed/${uri.slice('at://'.length)}?${searchParams.toString()}`

  return (
    <div className="bluesky-embed flex w-full max-w-[600px]" data-uri={uri}>
      <iframe
        src={src}
        data-bluesky-uri={uri}
        style={{ height }}
        width="100%"
        height="500px"
        title="Bluesky Post"
      />
    </div>
  )
}
