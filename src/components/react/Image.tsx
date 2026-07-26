import type { ImgHTMLAttributes } from 'react'

// components/Image.tsx (next/image ラッパ) の置き換え。
// 画像は public/ から素のまま配信し、ビルド後に optimize-static-images.mjs が
// dist/ 側を再圧縮する（Cloudflare 移行時点で既に unoptimized 配信のため挙動不変）
export default function Image(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} />
}
