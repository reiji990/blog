'use client'

import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

const DoughnutChart = ({ data, options }) => {
  // ラッパ (DonutChart.astro の h-64) の高さいっぱいに描く。既定の
  // maintainAspectRatio: true だと幅から高さを決めてラッパをはみ出し、
  // 高さ固定の親との間でリサイズが収束しない
  return <Doughnut data={data} options={{ maintainAspectRatio: false, ...options }} />
}

export default DoughnutChart
