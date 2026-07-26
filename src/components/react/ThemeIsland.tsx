import { ThemeProvider } from 'next-themes'
import ThemeSwitch from './ThemeSwitch'

/**
 * Next 版では app/theme-providers.tsx の ThemeProvider がアプリ全体を包み、
 * ThemeSwitch はその Context を参照していた。
 *
 * Astro では島ごとに React ツリーが独立するため、Provider をページ全体に
 * 敷くことはできない（敷くと結局アプリ全体が React になり islands の利点が消える）。
 * next-themes の ThemeProvider は localStorage と documentElement の class を
 * 操作するだけで DOM 全体に効くので、スイッチ本体だけを包めば足りる。
 *
 * テーマを参照する他のコンポーネント（Mermaid）は Context ではなく
 * documentElement の class を MutationObserver で監視する方式に変更済み。
 *
 * 初回描画のちらつき防止は Context では間に合わないため、
 * src/components/ThemeScript.astro が head でインラインに処理する。
 */
export default function ThemeIsland({ defaultTheme }: { defaultTheme: string }) {
  return (
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem>
      <ThemeSwitch />
    </ThemeProvider>
  )
}
