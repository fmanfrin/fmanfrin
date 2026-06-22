'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Competition {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  criteria: string;
  prize_pool?: string;
  status: string;
  joined: boolean;
}

interface CompetitionRanking {
  position: number;
  employee_name: string;
  points: number;
  badge?: string;
}

export default function CompetitionsPage() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [ranking, setRanking] = useState<CompetitionRanking[]>([]);
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: employee } = await supabase
        .from('employees')
        .select('id, organization_id')
        .eq('profile_id', user.user?.id)
        .single();

      if (!employee) {
        setLoading(false);
        return;
      }

      setEmployeeId(employee.id);

      const { data: compsData } = await supabase
        .from('competitions')
        .select('*')
        .eq('organization_id', employee.organization_id)
        .order('start_date', { ascending: false });

      if (compsData) {
        const { data: joined } = await supabase
          .from('competition_participants')
          .select('competition_id')
          .eq('employee_id', employee.id);

        const joinedIds = joined?.map(j => j.competition_id) || [];

        const formatted = compsData.map((c: any) => ({
          ...c,
          joined: joinedIds.includes(c.id),
          status: getCompetitionStatus(c.start_date, c.end_date),
        }));

        setCompetitions(formatted);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setLoading(false);
    }
  };

  const getCompetitionStatus = (start: string, end: string): string => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) return 'scheduled';
    if (now > endDate) return 'ended';
    return 'active';
  };

  const joinCompetition = async (compId: string) => {
    const { error } = await supabase
      .from('competition_participants')
      .insert([{
        competition_id: compId,
        employee_id: employeeId,
      }]);

    if (error) {
      alert('Erro ao participar: ' + error.message);
      return;
    }

    setCompetitions(competitions.map(c =>
      c.id === compId ? { ...c, joined: true } : c
    ));
  };

  const leaveCompetition = async (compId: string) => {
    const { error } = await supabase
      .from('competition_participants')
      .delete()
      .eq('competition_id', compId)
      .eq('employee_id', employeeId);

    if (error) {
      alert('Erro ao sair: ' + error.message);
      return;
    }

    setCompetitions(competitions.map(c =>
      c.id === compId ? { ...c, joined: false } : c
    ));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'ended': return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  const getCriteriaLabel = (criteria: string): string => {
    const labels: Record<string, string> = {
      'largest_score': 'Maior Pontuação',
      'best_avg': 'Melhor Média',
      'most_completed': 'Mais Conclusões',
      'fastest': 'Mais Rápido',
      'best_improvement': 'Melhor Evolução',
    };
    return labels[criteria] || criteria;
  };

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Carregando...</p></div>;
  }

  const activeComps = competitions.filter(c => c.status === 'active');
  const scheduledComps = competitions.filter(c => c.status === 'scheduled');
  const endedComps = competitions.filter(c => c.status === 'ended');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Competições</h1>

      {/* Active Competitions */}
      {activeComps.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            Competições Ativas
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {activeComps.map((comp) => (
              <div key={comp.id} className="bg-gradient-to-br from-green-500/20 to-slate-800 rounded-lg border border-green-500/50 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white flex-1">{comp.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(comp.status)}`}>
                    🔴 Ativa
                  </span>
                </div>

                {comp.description && (
                  <p className="text-slate-300 text-sm mb-3">{comp.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm mb-4 p-3 bg-black/20 rounded">
                  <div>
                    <p className="text-slate-400 text-xs">Critério</p>
                    <p className="text-slate-100 font-medium">{getCriteriaLabel(comp.criteria)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Encerra</p>
                    <p className="text-slate-100 font-medium">{new Date(comp.end_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {comp.prize_pool && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded mb-4">
                    <p className="text-yellow-300 text-sm">🏆 {comp.prize_pool}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {comp.joined ? (
                    <>
                      <button
                        onClick={() => setSelectedComp(comp)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Ver Ranking
                      </button>
                      <button
                        onClick={() => leaveCompetition(comp.id)}
                        className="flex-1 px-4 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 text-sm font-medium"
                      >
                        Sair
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => joinCompetition(comp.id)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      ✅ Participar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Competitions */}
      {scheduledComps.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            Em Breve
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {scheduledComps.map((comp) => (
              <div key={comp.id} className="bg-yellow-500/10 rounded-lg border border-yellow-500/30 p-6">
                <h3 className="text-lg font-bold text-white mb-2">{comp.name}</h3>
                <p className="text-slate-300 text-sm mb-4">{comp.description}</p>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-slate-400">Início: {new Date(comp.start_date).toLocaleDateString('pt-BR')}</span>
                  <span className="text-yellow-300 font-medium">🟡 Agendada</span>
                </div>
                <button
                  onClick={() => joinCompetition(comp.id)}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                >
                  Acompanhar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ended Competitions */}
      {endedComps.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
            Encerradas
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {endedComps.map((comp) => (
              <div key={comp.id} className="bg-slate-700 rounded-lg border border-slate-600 p-6 opacity-75">
                <h3 className="text-lg font-bold text-white mb-2">{comp.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{comp.description}</p>
                <button
                  onClick={() => setSelectedComp(comp)}
                  className="w-full px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:text-white text-sm font-medium"
                >
                  Ver Resultados
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {competitions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">Nenhuma competição disponível no momento</p>
        </div>
      )}

      {/* Modal - Ranking Detalhado */}
      {selectedComp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto border border-slate-700">
            <div className="sticky top-0 bg-slate-900 p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{selectedComp.name}</h2>
              <button
                onClick={() => setSelectedComp(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-300 mb-6">{selectedComp.description || 'Competição'}</p>

              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Critério</p>
                    <p className="text-white font-medium text-sm">{getCriteriaLabel(selectedComp.criteria)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Status</p>
                    <p className={`font-medium text-sm ${selectedComp.status === 'active' ? 'text-green-300' : 'text-gray-300'}`}>
                      {selectedComp.status === 'active' ? '🔴 Ativa' : selectedComp.status === 'scheduled' ? '🟡 Agendada' : '⚫ Encerrada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Término</p>
                    <p className="text-white font-medium text-sm">{new Date(selectedComp.end_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">Ranking</h3>
              <p className="text-slate-400 text-center py-8">Dados de ranking em desenvolvimento...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
