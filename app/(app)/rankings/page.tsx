'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface RankingEntry {
  employee_id: string;
  full_name: string;
  points: number;
  level: string;
  badge_count: number;
  trainings_completed: number;
  position: number;
  position_change: number;
}

export default function RankingsPage() {
  const router = useRouter();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'month' | 'quarter'>('all');
  const [orgId, setOrgId] = useState('');
  const [userPosition, setUserPosition] = useState(0);

  useEffect(() => {
    fetchRankings();
  }, [period]);

  const fetchRankings = async () => {
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

      const { data: employees } = await supabase
        .from('employees')
        .select('id, full_name, organization_id')
        .eq('organization_id', membership.organization_id);

      if (!employees) {
        setLoading(false);
        return;
      }

      let rankings: RankingEntry[] = [];

      for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];

        const { data: points } = await supabase
          .from('points_events')
          .select('points')
          .eq('employee_id', emp.id);

        const totalPoints = points?.reduce((sum: number, p: any) => sum + p.points, 0) || 0;

        const { data: badges } = await supabase
          .from('employee_badges')
          .select('id')
          .eq('employee_id', emp.id);

        const { data: attempts } = await supabase
          .from('training_attempts')
          .select('id')
          .eq('employee_id', emp.id)
          .eq('status', 'completed');

        rankings.push({
          employee_id: emp.id,
          full_name: emp.full_name,
          points: totalPoints,
          level: calculateLevel(totalPoints),
          badge_count: badges?.length || 0,
          trainings_completed: attempts?.length || 0,
          position: 0,
          position_change: 0,
        });
      }

      rankings.sort((a, b) => b.points - a.points);
      rankings = rankings.map((r, idx) => ({ ...r, position: idx + 1 }));

      const currentUserEmp = employees.find((e: any) => e.organization_id === membership.organization_id);
      if (currentUserEmp) {
        const userRank = rankings.find(r => r.employee_id === currentUserEmp.id);
        if (userRank) {
          setUserPosition(userRank.position);
        }
      }

      setRankings(rankings);
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

  const getLevelColor = (lvl: string): string => {
    switch (lvl) {
      case 'Iniciante': return 'bg-blue-500/20 text-blue-300';
      case 'Aprendiz': return 'bg-cyan-500/20 text-cyan-300';
      case 'Desenvolvedor': return 'bg-green-500/20 text-green-300';
      case 'Especialista': return 'bg-yellow-500/20 text-yellow-300';
      case 'Mestre': return 'bg-orange-500/20 text-orange-300';
      case 'Elite': return 'bg-red-500/20 text-red-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getMedalEmoji = (position: number): string => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '';
  };

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Carregando...</p></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Rankings</h1>
          <p className="text-slate-400">Total de participantes: {rankings.length}</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'month', 'quarter'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {p === 'all' ? 'Todos os Tempos' : p === 'month' ? 'Este Mês' : 'Este Trimestre'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 */}
      {rankings.slice(0, 3).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {rankings.slice(0, 3).map((entry, idx) => (
            <div
              key={entry.employee_id}
              className={`rounded-lg border p-6 text-center transition transform hover:scale-105 ${
                idx === 0
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                  : idx === 1
                  ? 'bg-gradient-to-br from-gray-500/20 to-slate-500/20 border-gray-500/50'
                  : 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/50'
              }`}
            >
              <div className="text-5xl mb-3">{getMedalEmoji(idx + 1)}</div>
              <h3 className="text-xl font-bold text-white mb-1">{entry.full_name}</h3>
              <div className={`inline-block px-3 py-1 rounded mb-3 text-sm font-medium ${getLevelColor(entry.level)}`}>
                {entry.level}
              </div>
              <p className="text-2xl font-bold text-white mb-1">{entry.points.toLocaleString()} pts</p>
              <p className="text-sm text-slate-300">
                {entry.trainings_completed} treinamentos • {entry.badge_count} badges
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Posição</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Nome</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Nível</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-200">Pontos</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-200">Treinamentos</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-slate-200">Badges</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((entry, idx) => (
              <tr key={entry.employee_id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMedalEmoji(entry.position) || entry.position}</span>
                    <span className="text-slate-100 font-medium">#{entry.position}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-100 font-medium">{entry.full_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getLevelColor(entry.level)}`}>
                    {entry.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-white">{entry.points.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right text-slate-300">{entry.trainings_completed}</td>
                <td className="px-6 py-4 text-right text-slate-300">{entry.badge_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {userPosition > 0 && (
        <div className="mt-8 bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 text-center">
          <p className="text-blue-300">
            Você está na <span className="font-bold text-lg">posição {userPosition}</span> do ranking 🎯
          </p>
        </div>
      )}
    </div>
  );
}
