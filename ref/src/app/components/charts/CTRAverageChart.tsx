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

export function CTRAverageChart() {
  const data = {
    labels: ['CTR'],
    datasets: [{
      label: 'Click-Through Rate %',
      data: [5.2],
      backgroundColor: '#38bdf8'
    }]
  };
  return <Bar data={data} options={{ indexAxis: 'y', scales: { x: { max: 10 } } }} />;
}