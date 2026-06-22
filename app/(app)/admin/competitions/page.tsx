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
  status: string;
  participant_count: number;
  prize_pool: string;
}

export default function CompetitionsAdminPage() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    criteria: 'largest_score',
    prize_pool: '',
  });

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
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

    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .order('start_date', { ascending: false });

    if (!error && data) {
      setCompetitions(data);
    }
    setLoading(false);
  };

  const createCompetition = async () => {
    if (!formData.name.trim() || !formData.start_date || !formData.end_date) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate <= startDate) {
      alert('Data de término deve ser após data de início');
      return;
    }

    const { data, error } = await supabase
      .from('competitions')
      .insert([{
        organization_id: orgId,
        name: formData.name,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        criteria: formData.criteria,
        status: new Date() < startDate ? 'scheduled' : 'active',
        prize_pool: formData.prize_pool || null,
      }])
      .select();

    if (error) {
      alert('Erro ao criar competição: ' + error.message);
      return;
    }

    setCompetitions([data[0], ...competitions]);
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      criteria: 'largest_score',
      prize_pool: '',
    });
    setShowCreateModal(false);
  };

  const getStatus = (comp: Competition): string => {
    const now = new Date();
    const start = new Date(comp.start_date);
    const end = new Date(comp.end_date);

    if (now < start) return 'scheduled';
    if (now > end) return 'ended';
    return 'active';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-300';
      case 'ended': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-slate-500/20 text-slate-300';
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Competições</h1>
          <p className="text-slate-400">Total: {competitions.length}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          + Nova Competição
        </button>
      </div>

      <div className="grid gap-6">
        {competitions.map((comp) => (
          <div key={comp.id} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{comp.name}</h3>
                {comp.description && (
                  <p className="text-slate-300 text-sm mb-3">{comp.description}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${getStatusColor(getStatus(comp))}`}>
                {getStatus(comp) === 'active' ? '🔴 Ativa' : getStatus(comp) === 'scheduled' ? '🟡 Agendada' : '⚫ Encerrada'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-700/50 rounded">
              <div>
                <p className="text-slate-400 text-xs mb-1">Critério</p>
                <p className="text-white font-medium text-sm">{getCriteriaLabel(comp.criteria)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Início</p>
                <p className="text-white font-medium text-sm">{new Date(comp.start_date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Término</p>
                <p className="text-white font-medium text-sm">{new Date(comp.end_date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Participantes</p>
                <p className="text-white font-medium text-sm">{comp.participant_count || 0}</p>
              </div>
            </div>

            {comp.prize_pool && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded mb-4">
                <p className="text-yellow-300 text-sm">🏆 Prêmios: {comp.prize_pool}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Visualizar Ranking
              </button>
              <button className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm">
                Editar
              </button>
              {getStatus(comp) === 'active' && (
                <button className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                  Encerrar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {competitions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Nenhuma competição cadastrada</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Criar Primeira Competição
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Nova Competição</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  placeholder="ex: Desafio de Vendas"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white h-20"
                  placeholder="Descreva a competição..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Início *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Término *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Critério</label>
                <select
                  value={formData.criteria}
                  onChange={(e) => setFormData({...formData, criteria: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="largest_score">Maior Pontuação</option>
                  <option value="best_avg">Melhor Média</option>
                  <option value="most_completed">Mais Conclusões</option>
                  <option value="fastest">Mais Rápido</option>
                  <option value="best_improvement">Melhor Evolução</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Prêmios</label>
                <input
                  type="text"
                  value={formData.prize_pool}
                  onChange={(e) => setFormData({...formData, prize_pool: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  placeholder="ex: 1º: Notebook, 2º: Fone, 3º: Voucher"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createCompetition}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Criar
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
