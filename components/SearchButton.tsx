'use client'

// pliny の KBarButton は pliny 配下の別インスタンスの kbar コンテキストを参照して
// しまうため、トップレベルの kbar を直接使う（SearchProvider と同じインスタンス）
import { useKBar } from 'kbar'

const SearchButton = () => {
  const { query } = useKBar()

  return (
    <button aria-label="検索" onClick={query.toggle}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="hover:text-primary-500 dark:hover:text-primary-400 text-fg-strong h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </button>
  )
}

export default SearchButton
