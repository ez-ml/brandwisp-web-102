'use client';

export interface VisibilityDistributionChartProps {
  data: {
    high: number;
    medium: number;
    low: number;
  };
}

export default function VisibilityDistributionChart({ data }: VisibilityDistributionChartProps) {
  return (
    <div className="text-white space-y-2">
      <div>🔼 High Visibility: {data.high}</div>
      <div>🔅 Medium Visibility: {data.medium}</div>
      <div>🔽 Low Visibility: {data.low}</div>
    </div>
  );
}
