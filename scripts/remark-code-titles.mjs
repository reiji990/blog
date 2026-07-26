import { visit } from 'unist-util-visit'

/**
 * pliny/mdx-plugins の remarkCodeTitles を内製化したもの。
 * pliny を依存から外すために移植した（実装は同一）。
 *
 * ```js:example.js のように言語の後ろに `:タイトル` を書くと、
 * コードブロックの直前に <div className="remark-code-title">タイトル</div> を挿入し、
 * node.lang からはタイトル部分を取り除く。
 */
export default function remarkCodeTitles() {
  return (tree) =>
    visit(tree, 'code', (node, index, parent) => {
      const nodeLang = node.lang || ''
      let language = ''
      let title = ''

      if (nodeLang.includes(':')) {
        language = nodeLang.slice(0, nodeLang.search(':'))
        title = nodeLang.slice(nodeLang.search(':') + 1, nodeLang.length)
      }

      if (!title) {
        return
      }

      const titleNode = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'remark-code-title' }],
        children: [{ type: 'text', value: title }],
        data: { _xdmExplicitJsx: true },
      }

      parent.children.splice(index, 0, titleNode)
      node.lang = language
    })
}
