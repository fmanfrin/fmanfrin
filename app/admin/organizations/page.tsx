'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Organization {
  id: string;
  name: string;
  cnpj?: string;
  plan: string;
  status: string;
  created_at: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrganizations(data);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Empresas</h1>
        <p className="text-slate-400">Gerencie todas as organizações da plataforma</p>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Nome</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">CNPJ</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Plano</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Data</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <td className="px-6 py-4 text-slate-100">{org.name}</td>
                <td className="px-6 py-4 text-slate-400">{org.cnpj || '-'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300">
                    {org.plan}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    org.status === 'active'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {new Date(org.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {organizations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">Nenhuma empresa cadastrada ainda</p>
        </div>
      )}
    </div>
  );
}
