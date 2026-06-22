'use client';

import { RankingEntry } from '@/lib/services/ranking';
import { Trophy, Medal } from 'lucide-react';

interface RankingMedalsProps {
  topThree: RankingEntry[];
  isLoading?: boolean;
}

export function RankingMedals({ topThree, isLoading }: RankingMedalsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  const medals = [
    { position: 1, color: 'bg-yellow-100 border-yellow-300', emoji: '🥇', label: 'Ouro' },
    { position: 2, color: 'bg-gray-100 border-gray-300', emoji: '🥈', label: 'Prata' },
    { position: 3, color: 'bg-orange-100 border-orange-300', emoji: '🥉', label: 'Bronze' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {topThree.map((entry, idx) => {
        const medal = medals[idx];
        return (
          <div
            key={entry.employeeId}
            className={`border-2 ${medal.color} rounded-lg p-6 text-center`}
          >
            <div className="text-4xl mb-2">{medal.emoji}</div>
            <h3 className="text-lg font-bold text-gray-900">{entry.employeeName}</h3>
            <p className="text-sm text-gray-600 mb-3">{entry.area}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{entry.points}</span>
                <span className="text-sm text-gray-600">pontos</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm">{entry.level}</span>
                <span className="text-lg">{entry.level === 'Iniciante' ? '🌱' : entry.level === 'Aprendiz' ? '📚' : entry.level === 'Desenvolvedor' ? '⚡' : entry.level === 'Especialista' ? '🎯' : entry.level === 'Mestre' ? '👑' : '⭐'}</span>
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p>{entry.trainingsCompleted} treinamentos</p>
              <p>{entry.badges} badges</p>
              <p className="font-semibold text-gray-900">{entry.avgScore}% média</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
