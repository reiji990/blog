import { visit, EXIT } from 'unist-util-visit'

const IMAGE_ATTRIBUTES = [
  { name: 'loading', value: 'eager' },
  { name: 'fetchPriority', value: 'high' },
]

/**
 * True for any node that renders as an image in the document body:
 *  - a plain mdast `image` node (e.g. a markdown image whose file isn't
 *    under /public, so pliny's `remarkImgToJsx` left it alone, or an
 *    external URL)
 *  - an `Image`/`img` JSX element (`mdxJsxFlowElement` for block-level
 *    usage, `mdxJsxTextElement` for inline usage), whether produced by
 *    `remarkImgToJsx` or written directly by the author
 */
function isImageNode(node) {
  if (node.type === 'image') {
    return true
  }
  if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
    return node.name === 'Image' || node.name === 'img'
  }
  return false
}

function hasAttribute(node, name) {
  return (node.attributes || []).some(
    (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === name
  )
}

/**
 * Add `name="value"` to a JSX element's attribute list, unless an attribute
 * with that name is already present (in which case the author's/upstream
 * plugin's explicit value wins and is left untouched).
 */
function setAttributeIfMissing(node, name, value) {
  if (hasAttribute(node, name)) {
    return
  }
  if (!node.attributes) {
    node.attributes = []
  }
  node.attributes.push({ type: 'mdxJsxAttribute', name, value })
}

/**
 * Remark plugin that eager-loads (and high-priority-fetches) only the first
 * image that appears in a document's body, in document order, then stops
 * looking entirely.
 *
 * Rationale: when the first in-body image is the page's LCP element,
 * next/image's default `loading="lazy"` delays it and hurts LCP. Every image
 * after the first one should stay lazy, so this only ever touches (at most)
 * one node per document.
 *
 * Must run *after* pliny's `remarkImgToJsx` in the remark pipeline, since
 * that's the plugin that turns plain markdown images into `Image` JSX
 * elements (`mdxJsxFlowElement`) in the first place - this plugin only
 * flips a switch on JSX image elements, it doesn't create them.
 *
 * Node handling:
 *  - If the first image node found is a raw mdast `image` node, nothing is
 *    done. `remarkImgToJsx` didn't turn it into an `Image` JSX element
 *    (typically because the file doesn't exist under /public, e.g. an
 *    external URL), so it compiles to a plain `<img>` with no `loading`
 *    attribute at all - and browsers already fetch those eagerly by
 *    default. Traversal still stops here: this was the first image, so no
 *    later image should be touched either.
 *  - If the first image node found is an `Image`/`img` JSX element
 *    (`mdxJsxFlowElement` or `mdxJsxTextElement`), it gets
 *    `loading="eager"` and `fetchPriority="high"` mdxJsxAttribute nodes
 *    added, skipping any attribute that's already explicitly set.
 */
export default function remarkFirstImageEager() {
  return (tree) => {
    visit(tree, isImageNode, (node) => {
      if (node.type === 'image') {
        return EXIT
      }

      for (const { name, value } of IMAGE_ATTRIBUTES) {
        setAttributeIfMissing(node, name, value)
      }

      return EXIT
    })
  }
}
