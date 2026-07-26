'use client'

// kbar を初期バンドルから外すため、このボタンは kbar に直接依存しない。
// クリック時にカスタムイベントを飛ばし、SearchProvider が遅延モジュール
// (SearchModal)をマウント/オープンする。ロード後は SearchModal 側の
// リスナーが同じイベントを受けて query.toggle する。
const SearchButton = () => {
  const onClick = () => {
    window.dispatchEvent(new CustomEvent('search:open'))
  }

  return (
    <button aria-label="検索" onClick={onClick}>
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
