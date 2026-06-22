'use client';

import { useState, useEffect } from 'react';
import { RankingMedals } from '@/components/rankings/ranking-medals';
import { RankingTable } from '@/components/rankings/ranking-table';
import { RankingEntry } from '@/lib/services/ranking';

interface RankingResponse {
  ranking: RankingEntry[];
  topThree: RankingEntry[];
  userPosition?: RankingEntry;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export default function RankingsPage() {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<'general' | 'department'>('general');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [departments, setDepartments] = useState<any[]>([]);

  // Fetch departments
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch('/api/departments');
        const result = await res.json();
        setDepartments(result.departments || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    }
    fetchDepartments();
  }, []);

  // Fetch rankings
  useEffect(() => {
    async function fetchRankings() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          type,
          page: page.toString(),
          limit: '50',
        });

        if (type === 'department' && departmentId) {
          params.append('departmentId', departmentId);
        }

        const res = await fetch(`/api/rankings?${params}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || 'Failed to fetch rankings');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRankings();
  }, [type, departmentId, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Rankings</h1>
          <p className="text-gray-600">Veja como você se compara com seus colegas</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as 'general' | 'department');
                  setPage(1);
                  setDepartmentId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">Geral</option>
                <option value="department">Por Área</option>
              </select>
            </div>

            {type === 'department' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Área</label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma área</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* User Position Card */}
        {data?.userPosition && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <h2 className="text-sm font-medium opacity-90 mb-2">Sua Posição</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">#{data.userPosition.position}</p>
                <p className="text-blue-100">de {data.pagination.total} colaboradores</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{data.userPosition.points}</p>
                <p className="text-blue-100">pontos</p>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Medals */}
        {!isLoading && data?.topThree && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Top 3</h2>
            <RankingMedals topThree={data.topThree} isLoading={isLoading} />
          </div>
        )}

        {/* Full Ranking Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {type === 'general' ? 'Ranking Geral' : 'Ranking por Área'}
          </h2>
          <RankingTable
            data={data?.ranking || []}
            isLoading={isLoading}
            currentUserId={data?.userPosition?.employeeId}
          />

          {/* Pagination */}
          {data?.pagination && data.pagination.total > 50 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando página {data.pagination.page} de{' '}
                {Math.ceil(data.pagination.total / data.pagination.limit)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(data.pagination.total / data.pagination.limit)}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
