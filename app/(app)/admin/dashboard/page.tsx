'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalEmployees: number;
  activeTrainings: number;
  completedTrainings: number;
  avgCompletionRate: number;
  avgScore: number;
  totalPoints: number;
  activeCompetitions: number;
}

interface TopPerformer {
  name: string;
  points: number;
  level: string;
  trainings_completed: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeTrainings: 0,
    completedTrainings: 0,
    avgCompletionRate: 0,
    avgScore: 0,
    totalPoints: 0,
    activeCompetitions: 0,
  });
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('profile_id', user.user?.id)
        .single();

      if (!membership) {
        setLoading(false);
        return;
      }

      setOrgId(membership.organization_id);

      // Fetch employees
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('organization_id', membership.organization_id);

      const totalEmployees = employees?.length || 0;

      // Fetch trainings
      const { data: trainings } = await supabase
        .from('trainings')
        .select('id, status')
        .eq('organization_id', membership.organization_id);

      const activeTrainings = trainings?.filter(t => t.status === 'published').length || 0;

      // Fetch training attempts
      const { data: attempts } = await supabase
        .from('training_attempts')
        .select('score, status')
        .in('employee_id', employees?.map(e => e.id) || []);

      const completedTrainings = attempts?.filter(a => a.status === 'completed').length || 0;
      const avgScore = attempts && attempts.length > 0
        ? attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / attempts.length
        : 0;
      const avgCompletionRate = totalEmployees > 0 ? (completedTrainings / (totalEmployees * activeTrainings || 1)) * 100 : 0;

      // Fetch points
      const { data: pointsData } = await supabase
        .from('points_events')
        .select('points')
        .eq('organization_id', membership.organization_id);

      const totalPoints = pointsData?.reduce((sum: number, p: any) => sum + p.points, 0) || 0;

      // Fetch competitions
      const { data: competitions } = await supabase
        .from('competitions')
        .select('id, status')
        .eq('organization_id', membership.organization_id);

      const activeCompetitions = competitions?.filter(c => c.status === 'active').length || 0;

      setStats({
        totalEmployees,
        activeTrainings,
        completedTrainings,
        avgCompletionRate: Math.round(avgCompletionRate),
        avgScore: Math.round(avgScore),
        totalPoints,
        activeCompetitions,
      });

      // Fetch top performers
      if (employees && employees.length > 0) {
        const top: TopPerformer[] = [];

        for (let i = 0; i < Math.min(5, employees.length); i++) {
          const emp = employees[i];
          const { data: empData } = await supabase
            .from('employees')
            .select('full_name')
            .eq('id', emp.id)
            .single();

          const { data: empPoints } = await supabase
            .from('points_events')
            .select('points')
            .eq('employee_id', emp.id);

          const points = empPoints?.reduce((sum: number, p: any) => sum + p.points, 0) || 0;

          const { data: empAttempts } = await supabase
            .from('training_attempts')
            .select('id')
            .eq('employee_id', emp.id)
            .eq('status', 'completed');

          const level = calculateLevel(points);

          top.push({
            name: empData?.full_name || 'N/A',
            points,
            level,
            trainings_completed: empAttempts?.length || 0,
          });
        }

        top.sort((a, b) => b.points - a.points);
        setTopPerformers(top.slice(0, 5));
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setLoading(false);
    }
  };

  const calculateLevel = (points: number): string => {
    if (points < 200) return 'Iniciante';
    if (points < 500) return 'Aprendiz';
    if (points < 1000) return 'Desenvolvedor';
    if (points < 2000) return 'Especialista';
    if (points < 4000) return 'Mestre';
    return 'Elite';
  };

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Carregando...</p></div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard Administrativo</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-900/20 rounded-lg border border-blue-500/50 p-6">
          <p className="text-blue-300 text-sm mb-2">👥 Total de Colaboradores</p>
          <p className="text-3xl font-bold text-white">{stats.totalEmployees}</p>
          <p className="text-blue-200 text-xs mt-2">Ativos na organização</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-900/20 rounded-lg border border-green-500/50 p-6">
          <p className="text-green-300 text-sm mb-2">📚 Treinamentos Ativos</p>
          <p className="text-3xl font-bold text-white">{stats.activeTrainings}</p>
          <p className="text-green-200 text-xs mt-2">Publicados</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-900/20 rounded-lg border border-purple-500/50 p-6">
          <p className="text-purple-300 text-sm mb-2">✅ Taxa de Conclusão</p>
          <p className="text-3xl font-bold text-white">{stats.avgCompletionRate}%</p>
          <p className="text-purple-200 text-xs mt-2">Média geral</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-900/20 rounded-lg border border-yellow-500/50 p-6">
          <p className="text-yellow-300 text-sm mb-2">⭐ Média de Notas</p>
          <p className="text-3xl font-bold text-white">{stats.avgScore}%</p>
          <p className="text-yellow-200 text-xs mt-2">Pontuação média</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <p className="text-slate-400 text-sm mb-2">🏆 Pontos Totais</p>
          <p className="text-3xl font-bold text-white">{stats.totalPoints.toLocaleString()}</p>
          <p className="text-slate-300 text-xs mt-2">Distribuídos aos colaboradores</p>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <p className="text-slate-400 text-sm mb-2">🎯 Competições Ativas</p>
          <p className="text-3xl font-bold text-white">{stats.activeCompetitions}</p>
          <p className="text-slate-300 text-xs mt-2">Em andamento</p>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <p className="text-slate-400 text-sm mb-2">✅ Treinamentos Concluídos</p>
          <p className="text-3xl font-bold text-white">{stats.completedTrainings}</p>
          <p className="text-slate-300 text-xs mt-2">No total</p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-6">🌟 Top Performers</h2>

        <div className="space-y-3">
          {topPerformers.map((performer, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-white font-medium">{performer.name}</p>
                  <p className="text-slate-400 text-sm">{performer.level} • {performer.trainings_completed} treinamentos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">{performer.points}</p>
                <p className="text-slate-400 text-xs">pontos</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 font-semibold transition text-center">
          📊 Ver Relatórios Detalhados
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 font-semibold transition text-center">
          ➕ Criar Novo Treinamento
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-6 font-semibold transition text-center">
          🎯 Gerenciar Competições
        </button>
      </div>
    </div>
  );
}
