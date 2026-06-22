'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface ReportData {
  id: string;
  name: string;
  level: string;
  department?: string;
  email: string;
  points: number;
  trainings_completed: number;
  avg_score: number;
  badges: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState<'employees' | 'trainings' | 'performance'>('employees');
  const [period, setPeriod] = useState<'all' | '30days' | '90days' | 'year'>('all');
  const [department, setDepartment] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
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

      if (!membership) return;

      setOrgId(membership.organization_id);

      const { data: depts } = await supabase
        .from('departments')
        .select('id, name')
        .eq('organization_id', membership.organization_id);

      setDepartments(depts || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const generateReport = async () => {
    if (!orgId) return;

    setLoading(true);
    try {
      let reportData: any[] = [];

      if (reportType === 'employees') {
        const { data: employees } = await supabase
          .from('employees')
          .select('id, full_name, email, organization_id')
          .eq('organization_id', orgId);

        if (employees) {
          for (const emp of employees) {
            const { data: points } = await supabase
              .from('points_events')
              .select('points')
              .eq('employee_id', emp.id);

            const { data: badges } = await supabase
              .from('employee_badges')
              .select('id')
              .eq('employee_id', emp.id);

            const { data: attempts } = await supabase
              .from('training_attempts')
              .select('score, status')
              .eq('employee_id', emp.id);

            const totalPoints = points?.reduce((sum: number, p: any) => sum + p.points, 0) || 0;
            const avgScore = attempts && attempts.length > 0
              ? attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / attempts.length
              : 0;

            reportData.push({
              id: emp.id,
              name: emp.full_name,
              email: emp.email,
              level: calculateLevel(totalPoints),
              points: totalPoints,
              trainings_completed: attempts?.filter(a => a.status === 'completed').length || 0,
              avg_score: Math.round(avgScore),
              badges: badges?.length || 0,
            });
          }
        }
      } else if (reportType === 'trainings') {
        const { data: trainings } = await supabase
          .from('trainings')
          .select('id, title, status, created_at')
          .eq('organization_id', orgId);

        if (trainings) {
          for (const training of trainings) {
            const { data: attempts } = await supabase
              .from('training_attempts')
              .select('score, status')
              .eq('training_id', training.id);

            const completions = attempts?.filter(a => a.status === 'completed').length || 0;
            const avgScore = attempts && attempts.length > 0
              ? attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / attempts.length
              : 0;

            reportData.push({
              id: training.id,
              name: training.title,
              status: training.status,
              total_attempts: attempts?.length || 0,
              completions,
              avg_score: Math.round(avgScore),
              approval_rate: attempts && attempts.length > 0
                ? Math.round((completions / attempts.length) * 100)
                : 0,
              created_date: new Date(training.created_at).toLocaleDateString('pt-BR'),
            });
          }
        }
      }

      setData(reportData);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao gerar relatório');
    } finally {
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

  const exportCSV = () => {
    if (data.length === 0) {
      alert('Gere um relatório primeiro');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Relatórios</h1>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Tipo de Relatório</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            >
              <option value="employees">Desempenho por Colaborador</option>
              <option value="trainings">Desempenho por Treinamento</option>
              <option value="performance">Análise de Performance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Período</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            >
              <option value="all">Todos os Tempos</option>
              <option value="30days">Últimos 30 Dias</option>
              <option value="90days">Últimos 90 Dias</option>
              <option value="year">Este Ano</option>
            </select>
          </div>

          {reportType === 'employees' && (
            <div>
              <label className="block text-sm text-slate-300 mb-2">Departamento</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="">Todos</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '⏳ Gerando...' : '📊 Gerar'}
            </button>
          </div>
        </div>

        {data.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              📥 Exportar CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-medium"
            >
              🖨️ Imprimir
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {data.length > 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                {Object.keys(data[0]).map(key => (
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-slate-200">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                  {Object.values(row).map((value: any, cellIdx) => (
                    <td key={cellIdx} className="px-6 py-3 text-slate-100">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-slate-900/50 px-6 py-3 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              Total de registros: <span className="font-bold text-white">{data.length}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <p>Gere um relatório para visualizar os dados</p>
        </div>
      )}

      {/* Report Types Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-white font-bold mb-2">👥 Desempenho por Colaborador</h3>
          <p className="text-blue-200 text-sm">Nome, Email, Nível, Pontos, Treinamentos, Notas, Badges</p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-white font-bold mb-2">📚 Desempenho por Treinamento</h3>
          <p className="text-green-200 text-sm">Título, Status, Tentativas, Conclusões, Taxa Aprovação</p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-white font-bold mb-2">📈 Análise de Performance</h3>
          <p className="text-purple-200 text-sm">Evolução, Trends, Comparativos, Insights</p>
        </div>
      </div>
    </div>
  );
}
