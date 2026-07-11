// サーバー(Vercel=UTC)とクライアント(JST)でロケール依存の日付がズレて
// hydration mismatch (#418) を起こさないよう、常にAsia/Tokyoで決定的にフォーマットする。
// en-CAロケールはYYYY-MM-DD形式を返す。リスト表示で多数回呼ばれるためモジュールレベルで1回だけ生成する。
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export default function formatYMD(date: string): string {
  return formatter.format(new Date(date))
}
