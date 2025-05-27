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

export function TopProductsChart() {
  const data = {
    labels: ['FocusGlow', 'BreatheWell', 'ZenOil', 'GlowMist', 'DeepSleep'],
    datasets: [
      {
        label: 'Impressions',
        data: [3400, 3200, 2800, 2900, 2600],
        backgroundColor: '#6366f1'
      },
      {
        label: 'CTR %',
        data: [5.2, 4.7, 4.1, 3.8, 3.6],
        backgroundColor: '#facc15'
      },
      {
        label: 'Conversions',
        data: [42, 38, 33, 29, 26],
        backgroundColor: '#34d399'
      }
    ]
  };
  return <Bar data={data} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />;
}
