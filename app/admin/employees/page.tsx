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
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Get organization from membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('profile_id', user.user?.id)
      .single();

    if (!membership) {
      setLoading(false);
      return;
    }

    // Fetch employees
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

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Colaboradores</h1>
          <p className="text-slate-400">Total: {employees.length}</p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Importar CSV
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Nome</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Email</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Cargo</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Data Admissão</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <td className="px-6 py-4 text-slate-100">{emp.full_name}</td>
                <td className="px-6 py-4 text-slate-400">{emp.email}</td>
                <td className="px-6 py-4 text-slate-400">{emp.job_title || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    emp.status === 'active'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {emp.admission_date
                    ? new Date(emp.admission_date).toLocaleDateString('pt-BR')
                    : '-'}
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
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Importar Colaboradores via CSV
          </button>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Importar Colaboradores</h2>
            <p className="text-slate-400 mb-6">
              Funcionalidade de import CSV será implementada em breve.
            </p>
            <button
              onClick={() => setShowImportModal(false)}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
