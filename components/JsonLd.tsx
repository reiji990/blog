// JSON-LD (application/ld+json) の <script> タグを共通化するコンポーネント。
// dangerouslySetInnerHTML に渡す前に `<` を エスケープ文字列 '\' + 'u003c' へ置換し、
// 埋め込み先の HTML パーサーに `</script>` 等として解釈されないようにする。
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
