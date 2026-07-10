'use client'

import { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react'

type Props = {
  id: string
  style?: CSSProperties
}

export default function YoutubevideoPlayer(props: Props) {
  const { id, style = {} } = props

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [screenWidth, setScreenWidth] = useState<CSSProperties['width']>()
  const [screenHeight, setScreenHeight] = useState<CSSProperties['height']>()
  const [isLandscape, setIsLandScape] = useState<boolean>(false)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  // クリック・トゥ・ロード: クリックされるまで iframe 自体を描画しない
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  // プライバシー強化ドメイン + クリック済みなので autoplay を付与
  const src = `https://www.youtube-nocookie.com/embed/${id}?persistence=1&oldScript=1&referer=&from=0&allowProgrammaticFullScreen=1&autoplay=1`

  const styleFullScreen: CSSProperties = isFullScreen
    ? {
        top: 0,
        left: isLandscape ? 0 : '100%',
        position: 'fixed',
        width: screenWidth,
        height: screenHeight,
        zIndex: 2147483647,
        maxWidth: 'none',
        transformOrigin: '0% 0%',
        transform: isLandscape ? 'none' : 'rotate(90deg)',
        WebkitTransformOrigin: '0% 0%',
        WebkitTransform: isLandscape ? 'none' : 'rotate(90deg)',
      }
    : {}

  // ファサード（サムネイル+再生ボタン）と再生後の iframe とで同一の枠サイズにし、
  // クリックしてもレイアウトシフトが発生しないようにする（従来の width=640/height=360 相当、16:9維持）
  const margedStyle: CSSProperties = {
    display: 'block',
    border: 'none',
    maxWidth: '100%',
    width: '640px',
    aspectRatio: '16 / 9',
    ...style,
    ...styleFullScreen,
  }

  interface MyEventData {
    eventName: string
    // 他のプロパティ
  }

  useEffect(() => {
    const onMessage = (event: MessageEvent<MyEventData>) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return
      if (event.data.eventName === 'enterProgrammaticFullScreen') {
        setIsFullScreen(true)
      } else if (event.data.eventName === 'exitProgrammaticFullScreen') {
        setIsFullScreen(false)
      }
    }

    window.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  useLayoutEffect(() => {
    if (!isFullScreen) return

    const initialScrollX = window.scrollX
    const initialScrollY = window.scrollY
    let timer: ReturnType<typeof setTimeout>
    let ended = false

    const pollingResize = () => {
      if (ended) return

      const isLandscape = window.innerWidth >= window.innerHeight
      const windowWidth = `${isLandscape ? window.innerWidth : window.innerHeight}px`
      const windowHeight = `${isLandscape ? window.innerHeight : window.innerWidth}px`

      setIsLandScape(isLandscape)
      setScreenWidth(windowWidth)
      setScreenHeight(windowHeight)
      timer = setTimeout(startPollingResize, 200)
    }

    const startPollingResize = () => {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(pollingResize)
      } else {
        pollingResize()
      }
    }

    startPollingResize()

    return () => {
      clearTimeout(timer)
      ended = true
      window.scrollTo(initialScrollX, initialScrollY)
    }
  }, [isFullScreen])

  useEffect(() => {
    if (!isFullScreen) return
    window.scrollTo(0, 0)
  }, [screenWidth, screenHeight, isFullScreen])

  if (!isLoaded) {
    return (
      <button
        type="button"
        onClick={() => setIsLoaded(true)}
        aria-label="動画を再生"
        className="group relative cursor-pointer overflow-hidden rounded-md border-0 bg-black p-0"
        style={margedStyle}
      >
        {/* サムネイルのみを転送し、実際の埋め込みiframeはクリックまで読み込まない */}
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image は i.ytimg.com 未許可のため意図的に生img */}
        <img
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 flex h-12 w-[68px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-[#212121]/80 transition-colors duration-150 group-hover:bg-red-600"
        >
          <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      src={src}
      width="640"
      height="360"
      style={margedStyle}
      allowFullScreen
      allow="autoplay"
      title="Youtube Player"
    />
  )
}
