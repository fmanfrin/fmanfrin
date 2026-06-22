'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trophy, Calendar, Users, Edit2, Trash2 } from 'lucide-react';

interface Competition {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'active' | 'ended';
  startDate: string;
  endDate: string;
  criteria: string;
  winnerCount: number;
}

export default function CompetitionsAdminPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchCompetitions();
  }, [statusFilter]);

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

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      draft: '✏️ Rascunho',
      scheduled: '📅 Agendada',
      active: '🔴 Ativa',
      ended: '✓ Encerrada',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              🎯 Gerenciar Competições
            </h1>
            <p className="text-gray-600">Crie e gerencie campanhas de engajamento</p>
          </div>
          <Link
            href="/app/admin/competitions/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Competição
          </Link>
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
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rascunho
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

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && competitions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr className="text-sm font-semibold text-gray-700">
                  <th className="text-left py-4 px-6">Nome</th>
                  <th className="text-left py-4 px-6">Status</th>
                  <th className="text-left py-4 px-6">Período</th>
                  <th className="text-center py-4 px-6">Prêmios</th>
                  <th className="text-center py-4 px-6">Ações</th>
                </tr>
              </thead>
              <tbody>
                {competitions.map((competition) => (
                  <tr
                    key={competition.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <h3 className="font-medium text-gray-900">{competition.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {competition.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(competition.status)}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(competition.startDate).toLocaleDateString('pt-BR')} —{' '}
                          {new Date(competition.endDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-gray-600">
                      <span className="font-medium">{competition.winnerCount}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/app/admin/competitions/${competition.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && competitions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma competição</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter
                ? 'Nenhuma competição encontrada com este filtro'
                : 'Comece criando sua primeira competição'}
            </p>
            <Link
              href="/app/admin/competitions/create"
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Nova Competição
            </Link>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
