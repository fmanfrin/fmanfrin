'use client';

import { useState, useEffect } from 'react';
import { Trophy, Calendar, Target, Users, Gift } from 'lucide-react';
import { RankingTable } from '@/components/rankings/ranking-table';

interface Competition {
  id: string;
  name: string;
  description: string;
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  criteria: string;
  status: 'draft' | 'scheduled' | 'active' | 'ended';
}

interface Prize {
  id: string;
  position: number;
  name: string;
  description?: string;
  valueEstimated: number;
  imageUrl?: string;
}

export default function CompetitionPage({
  params,
}: {
  params: { id: string };
}) {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [userPosition, setUserPosition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch competition details
        const detailRes = await fetch(`/api/competitions/${params.id}`);
        const detailData = await detailRes.json();

        if (!detailRes.ok) {
          throw new Error(detailData.error || 'Failed to fetch competition');
        }

        setCompetition(detailData.competition);
        setPrizes(detailData.prizes);
        setIsParticipant(detailData.isParticipant);

        // Fetch ranking
        const rankingRes = await fetch(`/api/competitions/${params.id}/ranking`);
        const rankingData = await rankingRes.json();

        if (rankingRes.ok) {
          setRanking(rankingData.ranking);
          setUserPosition(rankingData.userPosition);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  async function handleJoinCompetition() {
    try {
      const res = await fetch(`/api/competitions/${params.id}/join`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to join competition');
      }

      setIsParticipant(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              {error || 'Competition not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isActive = competition.status === 'active';
  const statusColor =
    competition.status === 'active'
      ? 'bg-green-100 text-green-800'
      : competition.status === 'ended'
        ? 'bg-gray-100 text-gray-800'
        : competition.status === 'scheduled'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Banner */}
        {competition.bannerUrl && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg h-48 bg-gray-200">
            <img
              src={competition.bannerUrl}
              alt={competition.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title and Status */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              🎯 {competition.name}
            </h1>
            <p className="text-gray-600">{competition.description}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${statusColor}`}>
            {competition.status === 'active'
              ? '🔴 Ativa'
              : competition.status === 'ended'
                ? '✓ Encerrada'
                : competition.status === 'scheduled'
                  ? '📅 Agendada'
                  : '✏️ Rascunho'}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">Período</span>
            </div>
            <p className="font-semibold text-gray-900">
              {new Date(competition.startDate).toLocaleDateString('pt-BR')} a{' '}
              {new Date(competition.endDate).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600">Critério</span>
            </div>
            <p className="font-semibold text-gray-900 capitalize">
              {competition.criteria === 'largest_score'
                ? 'Maior Pontuação'
                : competition.criteria === 'best_avg'
                  ? 'Melhor Média'
                  : competition.criteria === 'most_completed'
                    ? 'Mais Concluídos'
                    : competition.criteria === 'fastest'
                      ? 'Mais Rápido'
                      : 'Melhor Melhora'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">Participantes</span>
            </div>
            <p className="font-semibold text-gray-900">{ranking.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">Prêmios</span>
            </div>
            <p className="font-semibold text-gray-900">{prizes.length}</p>
          </div>
        </div>

        {/* Join Button */}
        {isActive && !isParticipant && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Participar da Competição</h3>
              <p className="text-sm text-gray-600">
                Junte-se aos demais colaboradores e compita pelos prêmios
              </p>
            </div>
            <button
              onClick={handleJoinCompetition}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Participar
            </button>
          </div>
        )}

        {isParticipant && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <span className="text-green-600">✓</span>
            <p className="text-green-800 font-medium">Você está participando desta competição</p>
          </div>
        )}

        {/* User Position */}
        {userPosition && (
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <h2 className="text-sm font-medium opacity-90 mb-2">Sua Posição</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">#{userPosition.position}</p>
                <p className="text-purple-100">de {ranking.length} participantes</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{userPosition.points}</p>
                <p className="text-purple-100">pontos</p>
              </div>
            </div>
          </div>
        )}

        {/* Prizes Section */}
        {prizes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Prêmios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {prizes.map((prize) => (
                <div
                  key={prize.id}
                  className={`rounded-lg p-4 border-2 ${
                    prize.position === 1
                      ? 'border-yellow-400 bg-yellow-50'
                      : prize.position === 2
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-orange-400 bg-orange-50'
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : '🥉'}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{prize.name}</h3>
                  {prize.description && (
                    <p className="text-sm text-gray-600 mb-2">{prize.description}</p>
                  )}
                  <p className="text-sm font-semibold text-gray-900">
                    Valor estimado: R$ {prize.valueEstimated.toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ranking */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Ranking
          </h2>
          <RankingTable
            data={ranking}
            isLoading={isLoading}
            currentUserId={userPosition?.employeeId}
          />
        </div>
      </div>
    </div>
  );
}
