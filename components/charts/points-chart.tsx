'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PointsChartProps {
  data: Array<{
    month: string;
    points: number;
  }>;
  title?: string;
}

export function PointsChart({ data, title = 'Evolução de Pontos' }: PointsChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="points"
            stroke="#3b82f6"
            dot={{ fill: '#3b82f6' }}
            name="Pontos"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
