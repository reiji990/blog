'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
  useRegisterActions,
  useKBar,
  VisualState,
  Action,
} from 'kbar'
import siteMetadata from '@/data/siteMetadata'
import formatYMD from '@/components/formatYMD'

interface SearchDoc {
  title: string
  subtitle?: string | null
  date: string
  tags?: string[]
  draft?: boolean
  path: string
}

// 日本語IMEの変換確定 Enter で記事遷移してしまう問題への対策。
// kbar は KBarResults が window の capture リスナーで Enter を拾って結果を実行するため、
// それより先に登録した capture リスナーで変換中・変換確定直後の Enter を握りつぶす。
// capture フェーズのリスナーは登録順に発火するので「ガードが KBarResults より先に
// 登録される」ことが実効性の条件になる。このガードはモーダルを開く前(KBarProvider が
// hidden の初回コミット)に登録され、KBarResults はモーダルを開いた次のコミットで
// 初めてマウントされるため、常にガードが先に登録され先に発火する。
// Safari は compositionend の後に isComposing=false の Enter keydown を
// 発火する既知の挙動があるため、確定直後 100ms も対象にする。
function useImeEnterGuard() {
  useEffect(() => {
    let lastCompositionEnd = 0
    const onCompositionEnd = (e: CompositionEvent) => {
      lastCompositionEnd = e.timeStamp
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Enter' &&
        (e.isComposing || e.keyCode === 229 || e.timeStamp - lastCompositionEnd < 100)
      ) {
        e.stopImmediatePropagation()
      }
    }
    window.addEventListener('compositionend', onCompositionEnd, { capture: true })
    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => {
      window.removeEventListener('compositionend', onCompositionEnd, { capture: true })
      window.removeEventListener('keydown', onKeyDown, { capture: true })
    }
  }, [])
}

const RenderResults = () => {
  const { results } = useMatches()
  if (!results.length) {
    return (
      <div className="border-border text-muted block border-t px-4 py-8 text-center">
        該当する記事がありません
      </div>
    )
  }
  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) => (
        <div>
          {typeof item === 'string' ? (
            <div className="pt-3">
              <div className="border-border text-muted block border-t px-4 pt-6 pb-2 text-xs font-semibold tracking-wide uppercase">
                {item}
              </div>
            </div>
          ) : (
            <div
              className={`flex cursor-pointer justify-between px-4 py-2 ${
                active ? 'bg-accent/15 text-fg-strong' : 'text-fg bg-transparent'
              }`}
            >
              <div className="block">
                {item.subtitle && <div className="text-muted text-xs">{item.subtitle}</div>}
                <div>{item.name}</div>
              </div>
            </div>
          )}
        </div>
      )}
    />
  )
}

const SearchDialog = ({ actions, isLoading }: { actions: Action[]; isLoading: boolean }) => {
  useRegisterActions(actions, [actions])
  useImeEnterGuard()
  return (
    <KBarPortal>
      <KBarPositioner className="z-50 bg-black/50 p-4 backdrop-blur">
        <KBarAnimator className="w-full max-w-xl">
          <div className="border-border bg-bg overflow-hidden rounded-2xl border">
            <div className="flex items-center space-x-4 p-4">
              <span className="block w-5">
                <svg
                  className="text-muted"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <KBarSearch
                defaultPlaceholder="記事を検索"
                className="text-fg placeholder-muted h-8 w-full bg-transparent focus:outline-none"
              />
              <kbd className="border-border text-muted inline-block rounded border px-1.5 align-middle text-xs leading-4 font-medium tracking-wide whitespace-nowrap">
                ESC
              </kbd>
            </div>
            {!isLoading && <RenderResults />}
            {isLoading && (
              <div className="border-border text-muted block border-t px-4 py-8 text-center">
                読み込み中…
              </div>
            )}
          </div>
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  )
}

// KBarProvider の内側で kbar の状態を操作するコントローラ。
// - /search.json をここで初めて fetch し、検索アクションを構築する
//   (= 検索を開くまでフェッチしない)
// - マウント時にモーダルを開く(kbar に defaultOpen が無いため)
// - ロード後の SearchButton クリック('search:open')を query.toggle に橋渡しする
function SearchController() {
  const router = useRouter()
  const { query } = useKBar()
  const [actions, setActions] = useState<Action[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const configuredPath =
      siteMetadata.search && 'kbarConfig' in siteMetadata.search
        ? siteMetadata.search.kbarConfig.searchDocumentsPath
        : undefined
    const searchDocumentsPath = typeof configuredPath === 'string' ? configuredPath : '/search.json'
    const load = async () => {
      const res = await fetch(searchDocumentsPath)
      const posts: SearchDoc[] = await res.json()
      const searchActions: Action[] = posts
        .filter((post) => post.draft !== true)
        .map((post) => ({
          id: post.path,
          name: post.subtitle ? `${post.title} ${post.subtitle}` : post.title,
          // タイトル・副題に加えタグでも検索できるようにする
          keywords: [post.title, post.subtitle, ...(post.tags ?? [])].filter(Boolean).join(' '),
          section: '記事',
          subtitle: `${formatYMD(post.date)}${
            post.tags?.length ? ' ・ ' + post.tags.join(' / ') : ''
          }`,
          perform: () => router.push('/' + post.path),
        }))
      if (cancelled) return
      setActions(searchActions)
      setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [router])

  // マウント時に検索モーダルを開く(defaultOpen 相当)。
  // toggle ではなく visualState を直接 animating-in にすることで、StrictMode の
  // effect 二重実行でも「開いたまま」を保つ(冪等)。この effect が走って初めて
  // モーダルが開き KBarResults がマウントされるため、上の useImeEnterGuard の
  // capture リスナーは常にこれより前(閉じている初回コミット)で登録済みになる。
  useEffect(() => {
    query.setVisualState(VisualState.animatingIn)
  }, [query])

  // ロード後の SearchButton クリックはカスタムイベントで届くので、ここで toggle する。
  // (初回ロードを起こしたクリック/⌘K は上のマウント時オープンが担うため二重で開かない)
  useEffect(() => {
    const onSearchOpen = () => query.toggle()
    window.addEventListener('search:open', onSearchOpen)
    return () => {
      window.removeEventListener('search:open', onSearchOpen)
    }
  }, [query])

  return <SearchDialog actions={actions} isLoading={!loaded} />
}

// このモジュール全体が next/dynamic({ ssr: false }) で遅延ロードされる。
// kbar の静的 import はこのファイルに閉じているため、検索を開くまで kbar は
// クライアントの初期チャンクに含まれない。
export default function SearchModal() {
  return (
    <KBarProvider actions={[]}>
      <SearchController />
    </KBarProvider>
  )
}
