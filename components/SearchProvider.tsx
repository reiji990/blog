'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// kbar 一式(KBarProvider・モーダルUI・IMEガード・/search.json フェッチ)は
// SearchModal に閉じており、検索インテント(検索ボタン or ⌘K/Ctrl+K)が初めて
// 発火するまで import しない。これにより kbar のコードは初期チャンクに載らない。
const SearchModal = dynamic(() => import('@/components/SearchModal'), { ssr: false })

export default function SearchProvider({ children }: { children: ReactNode }) {
  // 遅延モジュールを一度でもマウントしたか。一度ロードしたらアンマウントせず保持する。
  const [mounted, setMounted] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    const mount = () => {
      if (mountedRef.current) return
      mountedRef.current = true
      setMounted(true)
    }

    // ⌘K / Ctrl+K の初回発火で遅延モジュールをマウントする。
    // capture フェーズで拾い preventDefault してブラウザ既定動作を止める。
    // ロード後の2回目以降は kbar 自身の $mod+k ショートカット(KBarProvider 内蔵)に
    // 委ねるため、ここでは preventDefault せず素通りさせる。
    // これで自前リスナーと kbar の二重トグルを避ける。
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k') {
        if (mountedRef.current) return
        e.preventDefault()
        mount()
      }
    }

    // SearchButton からのカスタムイベント。初回はマウントを起こす。
    // ロード後は遅延モジュール側の 'search:open' リスナーが query.toggle を担うので、
    // ここでは何もしない(mount は冪等)。
    const onSearchOpen = () => mount()

    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('search:open', onSearchOpen)
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('search:open', onSearchOpen)
    }
  }, [])

  return (
    <>
      {mounted && <SearchModal />}
      {children}
    </>
  )
}
