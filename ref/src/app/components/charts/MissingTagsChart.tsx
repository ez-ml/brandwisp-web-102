"use client";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function MissingTagsChart() {
  const missingPercentage = 24; // e.g., 24% of products missing metadata

  const data = {
    labels: ['Missing Metadata'],
    datasets: [
      {
        label: '% Products Missing Tags/Alt Text',
        data: [missingPercentage],
        backgroundColor: '#f87171',
        borderRadius: 6
      }
    ]
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.x}%`
        }
      }
    },
    scales: {
      x: {
        max: 100,
        ticks: {
          color: '#ffffff',
          callback: (val: number) => `${val}%`
        },
        grid: {
          color: '#374151'
        }
      },
      y: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="w-full h-[200px]">
      <Bar data={data} options={options} />
    </div>
  );
}
