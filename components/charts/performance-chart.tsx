'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceChartProps {
  data: Array<{
    name: string;
    avgScore: number;
    completions: number;
  }>;
  title?: string;
}

export function PerformanceChart({
  data,
  title = 'Desempenho dos Treinamentos',
}: PerformanceChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis yAxisId="left" label={{ value: 'Nota (%)', angle: -90, position: 'insideLeft' }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Conclusões', angle: 90, position: 'insideRight' }}
          />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="avgScore" fill="#3b82f6" name="Nota Média %" />
          <Bar yAxisId="right" dataKey="completions" fill="#10b981" name="Conclusões" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
