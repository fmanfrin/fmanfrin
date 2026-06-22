'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

interface PointEvent {
  id: string;
  event_type: string;
  points: number;
  created_at: string;
  related_entity?: string;
}

export default function AchievementsPage() {
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState('Iniciante');
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('profile_id', user.user?.id)
        .single();

      if (!employee) {
        setLoading(false);
        return;
      }

      setEmployeeId(employee.id);

      const { data: badgesData } = await supabase
        .from('employee_badges')
        .select('id, badge:badges(id, name, description, icon), earned_at')
        .eq('employee_id', employee.id)
        .order('earned_at', { ascending: false });

      if (badgesData) {
        const formattedBadges = badgesData.map((b: any) => ({
          id: b.id,
          name: b.badge?.name || '',
          description: b.badge?.description || '',
          icon: b.badge?.icon || '🏅',
          earned_at: b.earned_at,
        }));
        setBadges(formattedBadges);
      }

      const { data: pointsData } = await supabase
        .from('points_events')
        .select('points')
        .eq('employee_id', employee.id);

      const totalPoints = pointsData?.reduce((sum: number, e: any) => sum + e.points, 0) || 0;
      setPoints(totalPoints);

      setLevel(calculateLevel(totalPoints));
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
      case 'Iniciante': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'Aprendiz': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      case 'Desenvolvedor': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'Especialista': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'Mestre': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'Elite': return 'bg-red-500/20 text-red-300 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  const levelThresholds = [
    { level: 'Iniciante', min: 0, max: 199 },
    { level: 'Aprendiz', min: 200, max: 499 },
    { level: 'Desenvolvedor', min: 500, max: 999 },
    { level: 'Especialista', min: 1000, max: 1999 },
    { level: 'Mestre', min: 2000, max: 3999 },
    { level: 'Elite', min: 4000, max: 9999 },
  ];

  const currentThreshold = levelThresholds.find(t => t.level === level);
  const nextThreshold = levelThresholds.find(t => t.level !== level && t.min > points);
  const progressToNext = nextThreshold ? Math.min(100, ((points - currentThreshold!.min) / (nextThreshold.min - currentThreshold!.min)) * 100) : 100;

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Carregando...</p></div>;
  }

  const defaultBadges = [
    { name: 'Primeiro Treinamento', icon: '🎓', earned: badges.some(b => b.name.includes('Primeiro')) },
    { name: 'Nota Máxima', icon: '⭐', earned: badges.some(b => b.name.includes('Máxima')) },
    { name: 'Sequência', icon: '🔥', earned: badges.some(b => b.name.includes('Sequência')) },
    { name: 'Especialista', icon: '👨‍💼', earned: badges.some(b => b.name.includes('Especialista')) },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Minhas Conquistas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Level Card */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <p className="text-slate-400 text-sm mb-2">Seu Nível</p>
          <div className={`inline-block px-4 py-2 rounded-lg border text-lg font-bold ${getLevelColor(level)}`}>
            {level}
          </div>
        </div>

        {/* Points Card */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <p className="text-slate-400 text-sm mb-2">Pontos Totais</p>
          <p className="text-3xl font-bold text-white">{points.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Acumulados</p>
        </div>

        {/* Next Level Card */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <p className="text-slate-400 text-sm mb-2">Próximo Nível</p>
          <p className="text-xl font-bold text-white">
            {nextThreshold ? nextThreshold.level : 'Você é Elite! 🎉'}
          </p>
          {nextThreshold && (
            <p className="text-xs text-slate-400 mt-1">
              {nextThreshold.min - points} pontos faltando
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <p className="text-slate-200 font-medium">Progresso para {nextThreshold?.level || 'Elite'}</p>
          <span className="text-slate-400 text-sm">{Math.round(progressToNext)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
            style={{ width: `${progressToNext}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>{currentThreshold?.min}</span>
          <span>{nextThreshold?.min || '9999'}</span>
        </div>
      </div>

      {/* Badges Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Badges Conquistadas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {defaultBadges.map((badge) => (
            <div
              key={badge.name}
              className={`rounded-lg border p-4 text-center transition ${
                badge.earned
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                  : 'bg-slate-700 border-slate-600 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <p className={`text-sm font-medium ${badge.earned ? 'text-yellow-300' : 'text-slate-400'}`}>
                {badge.name}
              </p>
              {!badge.earned && <p className="text-xs text-slate-500 mt-1">Bloqueado</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Earned Badges Timeline */}
      {badges.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Histórico de Conquistas</h2>
          <div className="space-y-3">
            {badges.map((badge) => (
              <div key={badge.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex items-center gap-4">
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-medium">{badge.name}</p>
                  <p className="text-sm text-slate-400">{badge.description}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(badge.earned_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
