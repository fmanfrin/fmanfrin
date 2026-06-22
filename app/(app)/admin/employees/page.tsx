'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  job_title?: string;
  status: string;
  admission_date?: string;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    job_title: '',
    admission_date: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
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
      .from('employees')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEmployees(data);
    }
    setLoading(false);
  };

  const createEmployee = async () => {
    if (!formData.full_name || !formData.email) {
      alert('Nome e email são obrigatórios');
      return;
    }

    const { data, error } = await supabase
      .from('employees')
      .insert([{
        organization_id: orgId,
        full_name: formData.full_name,
        email: formData.email,
        job_title: formData.job_title || null,
        admission_date: formData.admission_date || null,
        status: 'active',
      }])
      .select();

    if (error) {
      alert('Erro ao criar colaborador: ' + error.message);
      return;
    }

    setEmployees([...employees, data[0]]);
    setFormData({ full_name: '', email: '', job_title: '', admission_date: '' });
    setShowCreateModal(false);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const employees_to_import = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || null;
      });

      if (row.full_name && row.email) {
        employees_to_import.push({
          organization_id: orgId,
          full_name: row.full_name,
          email: row.email,
          job_title: row.job_title || null,
          admission_date: row.admission_date || null,
          status: 'active',
        });
      }
    }

    if (employees_to_import.length === 0) {
      alert('Nenhum colaborador válido encontrado no CSV');
      return;
    }

    const { data, error } = await supabase
      .from('employees')
      .insert(employees_to_import)
      .select();

    if (error) {
      alert('Erro ao importar: ' + error.message);
      return;
    }

    setEmployees([...employees, ...data]);
    setShowImportModal(false);
    alert(`${data.length} colaboradores importados com sucesso!`);
  };

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Carregando...</p></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Colaboradores</h1>
          <p className="text-slate-400">Total: {employees.length}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            + Novo Colaborador
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            📥 Importar CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Nome</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Email</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Cargo</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Admissão</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <td className="px-6 py-4 text-slate-100">{emp.full_name}</td>
                <td className="px-6 py-4 text-slate-400">{emp.email}</td>
                <td className="px-6 py-4 text-slate-400">{emp.job_title || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${emp.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {emp.admission_date ? new Date(emp.admission_date).toLocaleDateString('pt-BR') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Nenhum colaborador cadastrado</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Adicionar Colaborador
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Novo Colaborador</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Nome *</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Cargo</label>
                <input type="text" value={formData.job_title} onChange={(e) => setFormData({...formData, job_title: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Data Admissão</label>
                <input type="date" value={formData.admission_date} onChange={(e) => setFormData({...formData, admission_date: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
              </div>
              <div className="flex gap-3">
                <button onClick={createEmployee} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Criar
                </button>
                <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Importar CSV</h2>
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">Formato esperado: full_name, email, job_title, admission_date</p>
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="w-full text-slate-300" />
              <button onClick={() => setShowImportModal(false)} className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
