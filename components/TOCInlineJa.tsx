import TOCInline from 'pliny/ui/TOCInline'
import type { ComponentProps } from 'react'

type TOCInlineProps = ComponentProps<typeof TOCInline>

// pliny の TOCInline は asDisclosure 時に見出し "Table of Contents" を
// ハードコードしているため、「目次」見出しの disclosure で置き換える。
// MDX 本文側の <TOCInline ... asDisclosure /> はそのまま使える。
export default function TOCInlineJa({ asDisclosure, collapse, ...rest }: TOCInlineProps) {
  if (!asDisclosure) {
    return <TOCInline collapse={collapse} {...rest} />
  }
  return (
    <details open={!collapse}>
      <summary className="ml-6 pt-2 pb-2 text-xl font-bold">目次</summary>
      <div className="ml-6">
        <TOCInline {...rest} />
      </div>
    </details>
  )
}
