"use client";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement as ChartBarElement,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, ChartBarElement, Tooltip, Legend);

export function CVRAverageChart() {
  const data = {
    labels: ['CVR'],
    datasets: [{
      label: 'Conversion Rate %',
      data: [3.8],
      backgroundColor: '#4ade80'
    }]
  };
  return <Bar data={data} options={{ indexAxis: 'y', scales: { x: { max: 10 } } }} />;
}
