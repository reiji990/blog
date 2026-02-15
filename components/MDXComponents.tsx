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
import AppleMusicPlayer from '@/components/AppleMusic'
import { Tweet } from 'react-tweet'
import TableWrapper from './TableWrapper'
import DonutChart from './DonutChart'
import LineChart from './LineChart'
import Mermaid from './Mermaid'
import BlueskyPostEmbed from '@/components/Bluesky'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
  Source,
  Caption,
  NicovideoPlayer,
  YoutubevideoPlayer,
  SpotifyPlayer,
  AppleMusicPlayer,
  Tweet,
  DonutChart,
  LineChart,
  Mermaid,
  BlueskyPostEmbed,
}
