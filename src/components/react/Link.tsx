import type { AnchorHTMLAttributes } from 'react'

// components/Link.tsx の移植。next/link は不要なので素の <a> にする。
// island 内で使う React 版（静的な .astro 版は src/components/Link.astro）
export default function CustomLink({
  href,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) {
  const isInternal = !!href && (href.startsWith('/') || href.startsWith('#'))
  if (isInternal) return <a className="break-words" href={href} {...rest} />
  return (
    <a className="break-words" target="_blank" rel="noopener noreferrer" href={href} {...rest} />
  )
}
