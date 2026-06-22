'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { PerformanceChart } from '@/components/charts/performance-chart';
import { Users, BookOpen, Target, Trophy, TrendingUp, Award } from 'lucide-react';

interface DashboardData {
  kpis: {
    totalEmployees: number;
    activeEmployees: number;
    totalTrainings: number;
    publishedTrainings: number;
    completedTrainings: number;
    avgCompletionRate: number;
    avgApprovalRate: number;
    totalPoints: number;
    usersWithPoints: number;
    avgUserPoints: number;
    activeCompetitions: number;
    endedCompetitions: number;
  };
  trainingPerformance: Array<{
    name: string;
    avgScore: number;
    completions: number;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/dashboard');
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

  const kpis = data.kpis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Dashboard Administrativo</h1>
          <p className="text-gray-600">Acompanhe o desempenho da sua organização</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Colaboradores Ativos"
            value={kpis.activeEmployees}
            icon={<Users />}
            color="blue"
            subtitle={`de ${kpis.totalEmployees} total`}
          />
          <StatCard
            title="Treinamentos Publicados"
            value={kpis.publishedTrainings}
            icon={<BookOpen />}
            color="green"
            subtitle={`de ${kpis.totalTrainings} total`}
          />
          <StatCard
            title="Taxa de Aprovação"
            value={`${kpis.avgApprovalRate}%`}
            icon={<TrendingUp />}
            color="purple"
            subtitle={`${kpis.completedTrainings} concluídos`}
          />
          <StatCard
            title="Competições Ativas"
            value={kpis.activeCompetitions}
            icon={<Trophy />}
            color="orange"
            subtitle={`${kpis.endedCompetitions} encerradas`}
          />
        </div>

        {/* Second Row KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Pontos Distribuídos"
            value={kpis.totalPoints.toLocaleString('pt-BR')}
            icon={<Award />}
            color="yellow"
            subtitle={`Média: ${kpis.avgUserPoints} por pessoa`}
          />
          <StatCard
            title="Taxa de Conclusão"
            value={`${kpis.avgCompletionRate}%`}
            icon={<Target />}
            color="green"
            subtitle={`${kpis.completedTrainings} treinamentos`}
          />
          <StatCard
            title="Usuários com Pontos"
            value={kpis.usersWithPoints}
            icon={<TrendingUp />}
            color="blue"
            subtitle={`${Math.round((kpis.usersWithPoints / kpis.totalEmployees) * 100)}% engajamento`}
          />
          <StatCard
            title="Média de Pontos"
            value={Math.round(kpis.totalPoints / Math.max(1, kpis.usersWithPoints))}
            icon={<Award />}
            color="purple"
            subtitle="Por colaborador"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PerformanceChart data={data.trainingPerformance} />

          {/* Top Trainings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Treinamentos com Melhor Desempenho</h2>
            <div className="space-y-3">
              {data.trainingPerformance.slice(0, 5).map((training, idx) => (
                <div key={idx} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 truncate">{training.name}</p>
                    <p className="text-sm text-gray-600">{training.completions} conclusões</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{training.avgScore}%</p>
                    <p className="text-xs text-gray-600">nota média</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Engajamento Geral</h3>
            <p className="text-3xl font-bold text-blue-900">
              {Math.round((kpis.usersWithPoints / kpis.totalEmployees) * 100)}%
            </p>
            <p className="text-sm text-blue-700 mt-2">
              {kpis.usersWithPoints} de {kpis.totalEmployees} colaboradores ativos
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
            <h3 className="text-sm font-medium text-green-900 mb-2">Desempenho Médio</h3>
            <p className="text-3xl font-bold text-green-900">{kpis.avgApprovalRate}%</p>
            <p className="text-sm text-green-700 mt-2">Taxa média de aprovação em treinamentos</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
            <h3 className="text-sm font-medium text-purple-900 mb-2">Progressão</h3>
            <p className="text-3xl font-bold text-purple-900">{kpis.avgUserPoints}</p>
            <p className="text-sm text-purple-700 mt-2">Pontos médios por colaborador</p>
          </div>
        </div>
      </div>
    </div>
  );
}
