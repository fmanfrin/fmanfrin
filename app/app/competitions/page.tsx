'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Trophy, Calendar, Users } from 'lucide-react';

interface Competition {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'active' | 'ended';
  startDate: string;
  endDate: string;
  criteria: string;
}

export default function CompetitionsListPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    async function fetchCompetitions() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (statusFilter) {
          params.append('status', statusFilter);
        }

        const res = await fetch(`/api/competitions?${params}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch competitions');
        }

        setCompetitions(data.competitions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompetitions();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <Flame className="w-3 h-3" />
            Ativa
          </div>
        );
      case 'scheduled':
        return (
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            📅 Agendada
          </div>
        );
      case 'ended':
        return (
          <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            ✓ Encerrada
          </div>
        );
      default:
        return (
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            ✏️ Rascunho
          </div>
        );
    }
  };

  const getCriteriaLabel = (criteria: string) => {
    switch (criteria) {
      case 'largest_score':
        return 'Maior Pontuação';
      case 'best_avg':
        return 'Melhor Média';
      case 'most_completed':
        return 'Mais Concluídos';
      case 'fastest':
        return 'Mais Rápido';
      case 'best_improvement':
        return 'Melhor Melhora';
      default:
        return criteria;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            🎯 Competições
          </h1>
          <p className="text-gray-600">Participe de campanhas e disputas com seus colegas</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <label className="text-sm font-medium text-gray-700 mr-4">Filtrar por status:</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'scheduled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Agendadas
            </button>
            <button
              onClick={() => setStatusFilter('ended')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'ended'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Encerradas
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Competitions Grid */}
        {!isLoading && competitions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <Link
                key={competition.id}
                href={`/app/competitions/${competition.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                      {competition.name}
                    </h3>
                    {getStatusBadge(competition.status)}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {competition.description}
                  </p>

                  {/* Info */}
                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(competition.startDate).toLocaleDateString('pt-BR')} -{' '}
                        {new Date(competition.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Trophy className="w-4 h-4" />
                      <span>{getCriteriaLabel(competition.criteria)}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                    Ver Detalhes →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && competitions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma competição</h3>
            <p className="text-gray-600">
              {statusFilter
                ? 'Nenhuma competição encontrada com este filtro'
                : 'Nenhuma competição disponível no momento'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
