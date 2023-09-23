import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import Source from '@/components/Source'
import Caption from '@/components/Caption'
import NicovideoPlayer from '@/components/Niconico'
import YoutubevideoPlayer from '@/components/Youtube'
import SpotifyPlayer from '@/components/Spotify'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm,
  Source,
  Caption,
  NicovideoPlayer,
  YoutubevideoPlayer,
  SpotifyPlayer,
}
