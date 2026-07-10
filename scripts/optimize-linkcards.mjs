// remark-link-card-plus がダウンロードした OGP サムネイル画像 (public/remark-link-card-plus/,
// gitignore 対象・ビルド時生成) を、実際の表示幅に合わせてインプレースで縮小・再圧縮する。
//
// 表示幅の調査 (css/tailwind.css):
//   - デスクトップ/タブレット (ビューポート幅 >= 640px):
//       .remark-link-card-plus__thumbnail { flex: 0 0 200px; max-width: 200px }
//     常に固定 200px 幅で表示される。
//   - モバイル (`@media (max-width: 640px)` — このコンポーネント自身のブレークポイント):
//       thumbnail は max-width: 100% / height: 160px の上端画像になり、記事本文
//       (`.prose { max-width: 41rem }` = 656px) の幅まで拡大しうる。ただし実際には
//       ビューポート幅からパディング (px-4=32px / sm:px-6=48px) を引いた値で頭打ちに
//       なるため、640px 境界付近でも実効幅はおよそ 600px 前後、一般的なモバイル幅
//       (~375〜414px) では 320px 程度が目安となる。
//
// 上記のうちモバイル側が支配的なため、代表的な表示幅を 320px とし、高 DPI (2x) を
// 見込んで 2 倍した 640px を縮小の閾値として採用する。640px はデスクトップ側の
// 200px 固定枠を 3x DPR で見ても十分にカバーし (200*3=600 < 640)、かつこのコンポー
// ネント自身のブレークポイント値とも一致する。
//
// フォーマット判定は拡張子ではなく sharp の metadata() 実測値で行う (実際のキャッシュに
// 拡張子なしファイルが存在するため)。ico/svg 等の非対象フォーマットはスキップする。

import { readdir, readFile, writeFile, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const TARGET_DIR = path.join(process.cwd(), 'public', 'remark-link-card-plus')
const MAX_WIDTH = 640 // 表示幅目安 320px の 2 倍 (詳細は上記コメント参照)
const JPEG_QUALITY = 80
const PNG_COMPRESSION_LEVEL = 9

/**
 * 1ファイルを処理する。戻り値の status は以下のいずれか:
 *   'optimized' - 縮小・再圧縮して上書きした
 *   'skip'      - 対象外 (非対応フォーマット/既に閾値以下/アニメーション画像) のため何もしなかった
 *   'error'     - 読み込み・デコード・書き込みに失敗した (処理は継続する)
 */
async function processFile(filePath) {
  let input
  try {
    input = await readFile(filePath)
  } catch (err) {
    return { status: 'error', reason: `read failed: ${err.message}` }
  }
  const before = input.length

  let metadata
  try {
    metadata = await sharp(input, { failOn: 'none' }).metadata()
  } catch (err) {
    return { status: 'skip', reason: `undecodable (${err.message})` }
  }

  if (metadata.format !== 'jpeg' && metadata.format !== 'png') {
    return { status: 'skip', reason: `unsupported format: ${metadata.format}` }
  }

  // アニメーション PNG 等、複数フレームを持つ画像は縮小すると1フレームに潰れて
  // しまうため対象外にする (og:image としては極めて稀だが念のため)。
  if (metadata.pages && metadata.pages > 1) {
    return { status: 'skip', reason: `animated image (${metadata.pages} pages)` }
  }

  if (!metadata.width || metadata.width <= MAX_WIDTH) {
    return { status: 'skip', reason: 'already within max width' }
  }

  let image = sharp(input, { failOn: 'none' })
    .rotate() // EXIF Orientation をピクセルに焼き込んでから縮小する
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })

  image =
    metadata.format === 'jpeg'
      ? image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      : image.png({ compressionLevel: PNG_COMPRESSION_LEVEL })

  let output
  try {
    output = await image.toBuffer()
  } catch (err) {
    return { status: 'error', reason: `encode failed: ${err.message}` }
  }

  // 同一パスへの読み書き競合を避けるため、一時ファイル経由でアトミックに置き換える。
  const tmpPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.tmp-${process.pid}`
  )
  try {
    await writeFile(tmpPath, output)
    await rename(tmpPath, filePath)
  } catch (err) {
    await unlink(tmpPath).catch(() => {})
    return { status: 'error', reason: `write failed: ${err.message}` }
  }

  return { status: 'optimized', before, after: output.length }
}

async function main() {
  let entries
  try {
    entries = await readdir(TARGET_DIR, { withFileTypes: true })
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`[optimize-linkcards] ${TARGET_DIR} が存在しないためスキップします。`)
      return
    }
    throw err
  }

  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name)

  let optimized = 0
  let skipped = 0
  let errors = 0
  let totalBefore = 0
  let totalAfter = 0

  for (const name of files) {
    const filePath = path.join(TARGET_DIR, name)
    const result = await processFile(filePath)

    if (result.status === 'optimized') {
      optimized++
      totalBefore += result.before
      totalAfter += result.after
      console.log(`[optimize-linkcards] shrink: ${name} ${result.before}B -> ${result.after}B`)
    } else if (result.status === 'skip') {
      skipped++
    } else {
      errors++
      console.warn(`[optimize-linkcards] error: ${name}: ${result.reason}`)
    }
  }

  const saved = totalBefore - totalAfter
  const savedPct = totalBefore > 0 ? ((saved / totalBefore) * 100).toFixed(1) : '0.0'

  console.log(
    `[optimize-linkcards] 完了: ${files.length}件中 optimized=${optimized} skipped=${skipped} errors=${errors}`
  )
  console.log(
    `[optimize-linkcards] サイズ (optimized対象のみ): ${totalBefore}B -> ${totalAfter}B (削減 ${saved}B, ${savedPct}%)`
  )
}

main().catch((err) => {
  console.error('[optimize-linkcards] fatal error:', err)
  process.exitCode = 1
})
