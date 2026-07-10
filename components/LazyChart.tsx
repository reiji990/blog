'use client'

import dynamic from 'next/dynamic'

// chart.js本体を含むDonutChart/LineChartが読み込まれるまでの間、
// レイアウトずれ(CLS)を防ぐためのプレースホルダ
const ChartLoading = () => (
  <div className="border-border bg-bg h-64 w-full animate-pulse rounded-md border" />
)

export const DonutChart = dynamic(() => import('./DonutChart'), {
  ssr: false,
  loading: ChartLoading,
})

export const LineChart = dynamic(() => import('./LineChart'), {
  ssr: false,
  loading: ChartLoading,
})
