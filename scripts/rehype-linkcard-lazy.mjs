// React 19 automatically emits a `<link rel="preload">` in the document head
// during SSR for every `<img>` that doesn't already have `loading="lazy"` or
// `fetchPriority="low"` set (https://react.dev/blog/2024/12/05/react-19).
//
// remark-link-card-plus renders link-card thumbnails and favicons that sit
// below the fold and can add up to several hundred KB per post. Left
// untouched, those images get swept into React's automatic preload and
// compete for bandwidth with the LCP image (the post's banner) and the CSS
// on slow mobile connections - this was measured to hurt LCP on watanare02.
// Adding `loading="lazy"` stops React from preloading the image, so it's
// only fetched once the reader scrolls near it.
//
// Scope is deliberately narrowed to link-card images (matched by class name)
// so this never touches the first in-body image, which
// remark-first-image-eager.mjs deliberately keeps eager (and high priority)
// for the opposite reason - it's usually the LCP element itself. The two
// plugins pull in opposite directions and must not overlap.

import { visit } from 'unist-util-visit'

const LINKCARD_IMAGE_CLASS_NAMES = [
  'remark-link-card-plus__image',
  'remark-link-card-plus__favicon',
]

/**
 * True for a hast `element` node that is a remark-link-card-plus thumbnail or
 * favicon `<img>`.
 *
 * hast normally stores the HTML `class` attribute as `properties.className`
 * split into an array (that's what `rehypeRaw` produces when it parses the
 * raw HTML remark-link-card-plus emits), but nothing guarantees that shape,
 * so a plain string is handled too.
 */
function isLinkcardImage(node) {
  if (node.type !== 'element' || node.tagName !== 'img') {
    return false
  }
  const className = node.properties?.className
  if (Array.isArray(className)) {
    return className.some((name) => LINKCARD_IMAGE_CLASS_NAMES.includes(name))
  }
  if (typeof className === 'string') {
    return LINKCARD_IMAGE_CLASS_NAMES.some((name) => className.split(/\s+/).includes(name))
  }
  return false
}

/**
 * Set `properties[name] = value` on a hast element, unless that property is
 * already explicitly present (in which case the existing value wins and is
 * left untouched).
 */
function setPropertyIfMissing(node, name, value) {
  if (!node.properties) {
    node.properties = {}
  }
  if (node.properties[name] === undefined) {
    node.properties[name] = value
  }
}

/**
 * Rehype plugin that marks every remark-link-card-plus thumbnail/favicon
 * `<img>` as `loading="lazy"` / `decoding="async"`, so that React 19's SSR
 * auto-preload (see file header) skips them.
 *
 * Must run after `rehypeRaw`: remark-link-card-plus emits its markup as raw
 * HTML text, and only `rehypeRaw` turns that into real hast `element` nodes
 * with a `tagName` this plugin can match against.
 *
 * Unlike remark-first-image-eager.mjs, this doesn't stop at the first match
 * - every link-card image in the document is lazy, since none of them are
 * ever the LCP candidate.
 */
export default function rehypeLinkcardLazy() {
  return (tree) => {
    visit(tree, isLinkcardImage, (node) => {
      setPropertyIfMissing(node, 'loading', 'lazy')
      setPropertyIfMissing(node, 'decoding', 'async')
    })
  }
}
