interface Props {
  id: string
  theme?: 'light' | 'dark'
}

export default function AppleMusicPlayer({ id, theme = 'dark' }: Props) {
  // 1. 曲単体かアルバムかを判定
  // 「?i=」が含まれていれば曲単体、なければアルバムとみなす
  const isSong = id.includes('?i=')

  // 2. 高さを決定（曲なら175px、アルバムなら450pxがAppleの推奨値）
  const height = isSong ? 175 : 450

  const connector = id.includes('?') ? '&' : '?'
  const embedUrl = `https://embed.music.apple.com/jp/album/${id}${connector}theme=${theme}`

  return (
    <div style={{ width: '100%', maxWidth: '660px', minHeight: `${height}px` }}>
      <iframe
        allow="autoplay *; encrypted-media *;"
        style={{
          borderRadius: '12px',
          background: 'transparent',
        }}
        width="100%"
        height={height} // 動的に決定した高さを適用
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        src={embedUrl}
      ></iframe>
    </div>
  )
}
