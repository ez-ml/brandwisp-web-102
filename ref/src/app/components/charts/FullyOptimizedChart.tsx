// components/charts/FullyOptimizedChart.tsx
'use client';

import { Doughnut } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface FullyOptimizedChartProps {
  value: number;
}

export default function FullyOptimizedChart({ value }: FullyOptimizedChartProps) {
  const optimizedPercentage = Math.round(value);

  const data = {
    labels: ['Optimized', 'Not Optimized'],
    datasets: [
      {
        data: [optimizedPercentage, 100 - optimizedPercentage],
        backgroundColor: ['#4ade80', '#1f2937'],
        borderColor: ['#4ade80', '#1f2937'],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#fff',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.formattedValue}%`,
        },
      },
    },
  };

  return (
    <div className="relative w-full h-[250px]">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-green-400">{optimizedPercentage}%</span>
      </div>
    </div>
  );
}
