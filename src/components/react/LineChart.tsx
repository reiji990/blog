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
  return <Line data={data} options={options} />
}

export default LineChart
