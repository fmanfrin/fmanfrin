'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
    label: string;
  };
  subtitle?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'blue',
}: StatCardProps) {
  const colors = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50',
    orange: 'border-orange-200 bg-orange-50',
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${colors[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className={`text-2xl ${iconColors[color]}`}>{icon}</div>}
      </div>

      {trend && (
        <div
          className={`flex items-center gap-2 text-sm font-medium ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {trend.direction === 'up' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>
            {trend.direction === 'up' ? '+' : '-'}
            {trend.percentage}% {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}
