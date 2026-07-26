// 静的エクスポート (EXPORT=1) の出力 out/static/images/ にある記事画像を、
// 実際の表示幅に合わせて縮小・再圧縮する。
//
// 【なぜ必要か】
// Vercel では next/image が配信時に最適化していたため、原寸のまま public/ に置いても
// 問題がなかった。しかし output:'export' では最適化エンドポイントが存在せず
// (images.unoptimized 必須)、public/ の原寸ファイルがそのまま配信される。
// 実測では 4032x3024 / 1.8MB の iPhone 写真が2枚そのまま出ており、
// vilhelm-hammershoi の記事だけで約 3.6MB を転送する状態だった。
//
// 【なぜ out/ を対象にするのか】
// public/static/images/ は git 管理下の原本なので、インプレース書き換えは原本を破壊する。
// out/ はビルドごとに再生成される成果物なので、こちらを加工すれば原本は無傷のまま保て、
// 冪等性も自動的に確保される。optimize-linkcards.mjs が public/ (gitignore 対象の
// ビルド生成物) をインプレース処理しているのとは前提が異なる点に注意。
//
// 【MAX_WIDTH の根拠】
// - 記事本文: css/tailwind.css の .prose { max-width: 41rem } = 656px。2x DPR で 1312px。
// - PostBanner のヒーロー画像: layouts/PostBanner.tsx が width={1600} sizes="100vw" を指定。
// 両者を包含する 1600px を上限とする。これより小さい画像は拡大せずそのまま残す。
//
// 【フォーマットを変えない理由】
// WebP/AVIF へ変換すると拡張子が変わり、HTML 内の src 参照を全て書き換える必要がある。
// Phase 1 (ホスティング移行のみ) では影響範囲を広げないため、同一フォーマットのまま
// 縮小と再エンコードに留める。フォーマット変換は Astro 移行時に astro:assets へ委ねる。

import { readdir, readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const TARGET_DIR = path.join(process.cwd(), 'out', 'static', 'images')
const MAX_WIDTH = 1600
const JPEG_QUALITY = 82
const PNG_COMPRESSION_LEVEL = 9

/** 再帰的にファイルパスを列挙する */
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else if (entry.isFile()) {
      files.push(full)
    }
  }
  return files
}

/**
 * 1ファイルを処理する。
 * 縮小も再エンコードも効果がなかった場合は書き込まず skip を返す。
 */
async function processFile(filePath) {
  const before = (await stat(filePath)).size
  const input = await readFile(filePath)

  let image = sharp(input)
  let metadata
  try {
    metadata = await image.metadata()
  } catch {
    // 画像として解釈できないもの (.DS_Store 等) は対象外
    return { status: 'skip' }
  }

  const ops = []
  if (metadata.width > MAX_WIDTH) {
    image = image.resize({ width: MAX_WIDTH, withoutEnlargement: true })
    ops.push(`resize ${metadata.width}->${MAX_WIDTH}`)
  }

  if (metadata.format === 'jpeg') {
    image = image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    ops.push(`jpeg q${JPEG_QUALITY}`)
  } else if (metadata.format === 'png') {
    image = image.png({ compressionLevel: PNG_COMPRESSION_LEVEL })
    ops.push('png recompress')
  } else {
    // gif/svg/ico 等は対象外
    return { status: 'skip' }
  }

  const output = await image.toBuffer()

  // 縮まらなかった場合は原本を残す (再エンコードで太るケースがあるため)
  if (output.length >= before) {
    return { status: 'skip' }
  }

  await writeFile(filePath, output)
  return { status: 'optimized', before, after: output.length, ops: ops.join(', ') }
}

async function main() {
  let files
  try {
    files = await walk(TARGET_DIR)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`[optimize-static-images] ${TARGET_DIR} が存在しないためスキップします。`)
      return
    }
    throw err
  }

  let optimized = 0
  let skipped = 0
  let errors = 0
  let totalBefore = 0
  let totalAfter = 0

  for (const filePath of files) {
    const name = path.relative(TARGET_DIR, filePath)
    let result
    try {
      result = await processFile(filePath)
    } catch (err) {
      errors++
      console.warn(`[optimize-static-images] error: ${name}: ${err.message}`)
      continue
    }

    if (result.status === 'optimized') {
      optimized++
      totalBefore += result.before
      totalAfter += result.after
      console.log(
        `[optimize-static-images] shrink (${result.ops}): ${name} ${result.before}B -> ${result.after}B`
      )
    } else {
      skipped++
    }
  }

  const saved = totalBefore - totalAfter
  const savedPct = totalBefore > 0 ? ((saved / totalBefore) * 100).toFixed(1) : '0.0'

  console.log(
    `[optimize-static-images] 完了: ${files.length}件中 optimized=${optimized} skipped=${skipped} errors=${errors}`
  )
  console.log(
    `[optimize-static-images] サイズ (optimized対象のみ): ${totalBefore}B -> ${totalAfter}B (削減 ${saved}B, ${savedPct}%)`
  )
}

main().catch((err) => {
  console.error('[optimize-static-images] fatal error:', err)
  process.exitCode = 1
})
