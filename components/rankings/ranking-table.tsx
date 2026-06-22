'use client';

import { RankingEntry } from '@/lib/services/ranking';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RankingTableProps {
  data: RankingEntry[];
  isLoading?: boolean;
  currentUserId?: string;
}

function getChangeIcon(change?: 'up' | 'down' | 'stable') {
  switch (change) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    case 'stable':
      return <Minus className="w-4 h-4 text-gray-400" />;
    default:
      return <Minus className="w-4 h-4 text-gray-400" />;
  }
}

function getLevelColor(level: string) {
  switch (level) {
    case 'Iniciante':
      return 'bg-slate-100 text-slate-800';
    case 'Aprendiz':
      return 'bg-blue-100 text-blue-800';
    case 'Desenvolvedor':
      return 'bg-purple-100 text-purple-800';
    case 'Especialista':
      return 'bg-amber-100 text-amber-800';
    case 'Mestre':
      return 'bg-red-100 text-red-800';
    case 'Elite':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function RankingTable({ data, isLoading, currentUserId }: RankingTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200">
          <tr className="text-sm font-semibold text-gray-700">
            <th className="text-left py-3 px-4">#</th>
            <th className="text-left py-3 px-4">Nome</th>
            <th className="text-left py-3 px-4">Área</th>
            <th className="text-center py-3 px-4">Pontos</th>
            <th className="text-center py-3 px-4">Nível</th>
            <th className="text-center py-3 px-4">Treinamentos</th>
            <th className="text-center py-3 px-4">Badges</th>
            <th className="text-center py-3 px-4">Média</th>
            <th className="text-center py-3 px-4">Movimento</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr
              key={entry.employeeId}
              className={`border-b border-gray-100 text-sm transition-colors ${
                entry.employeeId === currentUserId
                  ? 'bg-blue-50 hover:bg-blue-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              <td className="py-3 px-4">
                <div className="flex items-center justify-center">
                  <span className="font-bold text-gray-900">#{entry.position}</span>
                </div>
              </td>
              <td className="py-3 px-4 font-medium text-gray-900">{entry.employeeName}</td>
              <td className="py-3 px-4 text-gray-600">{entry.area}</td>
              <td className="py-3 px-4 text-center">
                <span className="font-semibold text-gray-900">{entry.points}</span>
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(
                    entry.level
                  )}`}
                >
                  {entry.level}
                </span>
              </td>
              <td className="py-3 px-4 text-center text-gray-600">{entry.trainingsCompleted}</td>
              <td className="py-3 px-4 text-center text-gray-600">{entry.badges}</td>
              <td className="py-3 px-4 text-center font-medium text-gray-900">
                {entry.avgScore}%
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center">
                  {getChangeIcon(entry.change)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
