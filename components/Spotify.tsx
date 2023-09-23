interface Props {
  id: string
}

export default function SpotifyPlayer({ id }: Props) {
  return (
<iframe
  style={{ borderRadius: '12px' }}
    src={`https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`}
    width="100%"
    height="152"
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    loading="lazy"
   ></iframe>
 )
}
