'use client'

import { ReactNode, useEffect, useState } from 'react'
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
// kbar は window の capture リスナーで Enter を拾って結果を実行するため、
// それより先（Provider マウント時）に登録した capture リスナーで
// 変換中・変換確定直後の Enter を握りつぶす。
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

const SearchModal = ({ actions, isLoading }: { actions: Action[]; isLoading: boolean }) => {
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

export default function SearchProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [actions, setActions] = useState<Action[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return
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
      setActions(searchActions)
      setLoaded(true)
    }
    load()
  }, [loaded, router])

  return (
    <KBarProvider actions={[]}>
      <SearchModal actions={actions} isLoading={!loaded} />
      {children}
    </KBarProvider>
  )
}
