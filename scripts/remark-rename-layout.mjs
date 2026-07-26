/**
 * 【移行上の差分に対する shim】
 *
 * Astro の MDX 統合は frontmatter の `layout` を「レイアウトコンポーネントの
 * import パス」として予約している。一方このブログは contentlayer 時代から
 * `layout: 'PostBanner'` のように「レイアウト名」として使っており、そのままだと
 *   [vite]: Rollup failed to resolve import "PostBanner"
 * でビルドが落ちる。
 *
 * 記事 MDX を一切書き換えずに済ませるため、コンパイル時に frontmatter の
 * `layout` を `postLayout` へ退避し、Astro 側からは見えなくする。
 * ページ側は post.data.postLayout でレイアウトを選択する。
 */
export default function remarkRenameLayout() {
  return (_tree, file) => {
    const frontmatter = file.data?.astro?.frontmatter
    if (frontmatter && typeof frontmatter.layout === 'string') {
      frontmatter.postLayout = frontmatter.layout
      delete frontmatter.layout
    }
  }
}
