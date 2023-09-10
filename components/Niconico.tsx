'use client'

import { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react'

type Props = {
  id: string
  style?: CSSProperties
}

export default function NicovideoPlayer(props: Props) {
  const { id, style = {} } = props

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [screenWidth, setScreenWidth] = useState<CSSProperties['width']>()
  const [screenHeight, setScreenHeight] = useState<CSSProperties['height']>()
  const [isLandscape, setIsLandScape] = useState<boolean>(false)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)

  const src = `https://embed.nicovideo.jp/watch/${id}?persistence=1&oldScript=1&referer=&from=0&allowProgrammaticFullScreen=1`

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

  const margedStyle = {
    border: 'none',
    maxWidth: '100%',
    ...style,
    ...styleFullScreen,
  }

  useEffect(() => {
    const onMessage = (event: MessageEvent<string>) => {
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
    let timer: NodeJS.Timeout
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

  return (
    <iframe
      ref={iframeRef}
      src={src}
      width="640"
      height="360"
      style={margedStyle}
      allowFullScreen
      allow="autoplay"
      title="Niconico Player"
    />
  )
}
