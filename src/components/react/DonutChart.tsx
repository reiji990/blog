'use client'

import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

const DoughnutChart = ({ data, options }) => {
  return <Doughnut data={data} options={options} />
}

export default DoughnutChart
