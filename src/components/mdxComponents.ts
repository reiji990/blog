// components/MDXComponents.tsx の移植。
//
// 記事 MDX は一切書き換えず、ここで static / island を振り分ける。
// Astro の MDX では React コンポーネントは既定で静的レンダリングされるため、
// インタラクティブなものは .astro ラッパを噛ませて内部で client:visible を付ける。
// （client: ディレクティブは MDX ソース側にしか書けないので、記事を無改変に
//   保つにはこのラッパ方式が必要）
//
// BlogNewsletterForm は Next 版の map に登録されていたが、どの記事でも
// 未使用かつ静的サイトでは機能しないため移植しない。

// --- 静的レンダリングで足りるもの（JS を一切出さない） ---
import Source from './react/Source.tsx'
import Caption from './react/Caption.tsx'
import Dots from './react/Dots.tsx'
import SpotifyPlayer from './react/Spotify.tsx'
import AppleMusicPlayer from './react/AppleMusic.tsx'

// --- .astro ラッパ（内部で island 化、または素のマークアップ） ---
import Image from './mdx/Image.astro'
import CustomLink from './mdx/Link.astro'
import Pre from './mdx/Pre.astro'
import TableWrapper from './mdx/TableWrapper.astro'
import TOCInline from './mdx/TOCInline.astro'
import YoutubevideoPlayer from './mdx/YoutubevideoPlayer.astro'
import NicovideoPlayer from './mdx/NicovideoPlayer.astro'
import BlueskyPostEmbed from './mdx/BlueskyPostEmbed.astro'
import Mermaid from './mdx/Mermaid.astro'
import DonutChart from './mdx/DonutChart.astro'
import LineChart from './mdx/LineChart.astro'
import Tweet from './mdx/Tweet.astro'

export const mdxComponents = {
  // HTML 要素の差し替え
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  // 記事から名前で呼ばれるもの
  Image,
  TOCInline,
  Source,
  Caption,
  Dots,
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
