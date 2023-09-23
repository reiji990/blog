import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function SpotifyPlayer(props: Props) {
  const { id } = props

  return (
    <iframe
        style={{ borderRadius: '12px' }}
        src={`https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
    ><a></a></iframe>
  )
}
