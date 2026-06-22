'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_name?: string;
  actor_id?: string;
  actor_name?: string;
  created_at: string;
  status: string;
  error_message?: string;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [filterAction, filterResource, filterDate]);

  const fetchAuditLogs = async () => {
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

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', membership.organization_id);

      if (filterAction) {
        query = query.eq('action', filterAction);
      }

      if (filterResource) {
        query = query.eq('resource_type', filterResource);
      }

      if (filterDate) {
        const date = new Date(filterDate);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        query = query
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDay.toISOString());
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(500);

      if (!error && data) {
        setLogs(data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setLoading(false);
    }
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'create': return 'bg-green-500/20 text-green-300';
      case 'update': return 'bg-blue-500/20 text-blue-300';
      case 'delete': return 'bg-red-500/20 text-red-300';
      case 'export': return 'bg-orange-500/20 text-orange-300';
      case 'login': return 'bg-cyan-500/20 text-cyan-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getActionEmoji = (action: string): string => {
    switch (action) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'export': return '📥';
      case 'login': return '🔓';
      default: return '📝';
    }
  };

  const getStatusColor = (status: string): string => {
    return status === 'success'
      ? 'text-green-300'
      : 'text-red-300';
  };

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Carregando...</p></div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Logs de Auditoria</h1>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Ação</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            >
              <option value="">Todas</option>
              <option value="create">Criar</option>
              <option value="update">Atualizar</option>
              <option value="delete">Deletar</option>
              <option value="export">Exportar</option>
              <option value="login">Login</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Tipo</label>
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            >
              <option value="">Todos</option>
              <option value="employee">Colaborador</option>
              <option value="training">Treinamento</option>
              <option value="competition">Competição</option>
              <option value="content">Conteúdo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Data</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterAction('');
                setFilterResource('');
                setFilterDate('');
              }}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-200">Ação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-200">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-200">Recurso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-200">Data & Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-200">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                    {getActionEmoji(log.action)} {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-300">{log.resource_type}</td>
                <td className="px-6 py-3 text-slate-100">{log.resource_name || '—'}</td>
                <td className="px-6 py-3 text-slate-400 text-xs">
                  {new Date(log.created_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-3">
                  <span className={`text-xs font-medium ${getStatusColor(log.status)}`}>
                    {log.status === 'success' ? '✅ Sucesso' : '❌ Erro'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-slate-900/50 px-6 py-3 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            Total: <span className="font-bold text-white">{logs.length}</span> registro(s)
          </p>
        </div>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          Nenhum log de auditoria encontrado
        </div>
      )}

      {/* Info */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-blue-300 font-semibold mb-2">ℹ️ Sobre os Logs de Auditoria</h3>
        <p className="text-blue-200 text-sm">
          Todos os eventos de criação, atualização e exclusão de recursos são registrados automaticamente.
          Os logs são mantidos por 12 meses para fins de auditoria e segurança.
        </p>
      </div>
    </div>
  );
}
