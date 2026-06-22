'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { PointsChart } from '@/components/charts/points-chart';
import { Award, BookOpen, TrendingUp, Zap } from 'lucide-react';

interface EmployeeDashboardData {
  employee: {
    full_name: string;
    email: string;
  };
  totalPoints: number;
  completedCount: number;
  avgScore: number;
  badgesCount: number;
  pointsByMonth: Array<{
    month: string;
    points: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/dashboard/employee');
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || 'Failed to fetch dashboard');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Failed to load dashboard'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Greeting */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bem-vindo, {data.employee.full_name}! 👋
          </h1>
          <p className="text-gray-600">Acompanhe sua evolução e conquistas</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Pontos Totais"
            value={data.totalPoints}
            icon={<Award />}
            color="blue"
            trend={{ direction: 'up', percentage: 12, label: 'este mês' }}
          />
          <StatCard
            title="Treinamentos Completos"
            value={data.completedCount}
            icon={<BookOpen />}
            color="green"
            subtitle="Aprovado em 100%"
          />
          <StatCard
            title="Média de Desempenho"
            value={`${data.avgScore}%`}
            icon={<TrendingUp />}
            color="purple"
            trend={{ direction: 'up', percentage: 5, label: 'vs mês anterior' }}
          />
          <StatCard
            title="Badges Conquistadas"
            value={data.badgesCount}
            icon={<Zap />}
            color="orange"
            subtitle="Mantenha o ritmo!"
          />
        </div>

        {/* Progress Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Sua Evolução</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-blue-100 text-sm mb-2">Nível Atual</p>
              <p className="text-4xl font-bold">Desenvolvedor</p>
              <p className="text-blue-100 text-sm mt-2">500 de 1000 pontos para Especialista</p>
            </div>
            <div>
              <div className="w-full bg-blue-400 rounded-full h-3 mb-2">
                <div className="bg-white rounded-full h-3 w-1/2"></div>
              </div>
              <p className="text-blue-100 text-sm">50% do próximo nível</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-2">Ranking Geral</p>
              <p className="text-4xl font-bold">12º</p>
              <p className="text-blue-100 text-sm mt-2">de 50 colaboradores</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PointsChart data={data.pointsByMonth} title="Evolução de Pontos (6 meses)" />

          {/* Próximos Passos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Próximos Passos</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 text-blue-600 font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Complete 2 treinamentos</h3>
                  <p className="text-sm text-gray-600 mt-1">Para atingir o próximo nível (Especialista)</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100 text-green-600 font-bold">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Participe da competição</h3>
                  <p className="text-sm text-gray-600 mt-1">Desafio Comercial - Prêmios em jogo!</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100 text-purple-600 font-bold">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Melhore sua média</h3>
                  <p className="text-sm text-gray-600 mt-1">Objetivo: atingir 95% de aprovação</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Badges Recentes</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-gray-900">⭐ Nota Máxima</p>
                  <p className="text-xs text-gray-600">Obteve 100% em um treinamento</p>
                </div>
                <span className="text-2xl">🎓</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-gray-900">⚡ Aprendiz Rápido</p>
                  <p className="text-xs text-gray-600">Completou em tempo recorde</p>
                </div>
                <span className="text-2xl">🚀</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Meta do Mês</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">Completar treinamentos</p>
                  <p className="text-sm text-gray-600">3 de 5</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 rounded-full h-2 w-3/5"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">Ganhar 200 pontos</p>
                  <p className="text-sm text-gray-600">150 de 200</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 rounded-full h-2 w-3/4"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">Chegar Top 10</p>
                  <p className="text-sm text-gray-600">12º lugar</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 rounded-full h-2 w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
