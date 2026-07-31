// components/LineChart.js
'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Chart.jsの設定を事前に登録
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const LineChart = ({ data, options }) => {
  // ラッパ (LineChart.astro の h-64) の高さいっぱいに描く。既定の
  // maintainAspectRatio: true だと幅から高さを決めてラッパをはみ出し、
  // 高さ固定の親との間でリサイズが収束しない
  return <Line data={data} options={{ maintainAspectRatio: false, ...options }} />
}

export default LineChart
