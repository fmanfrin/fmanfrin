'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Department {
  id: string;
  name: string;
  description?: string;
}

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
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

    const { data } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .order('name');

    if (data) {
      setDepartments(data);
    }
    setLoading(false);
  };

  const createDepartment = async () => {
    if (!formData.name) {
      alert('Nome é obrigatório');
      return;
    }

    const { data, error } = await supabase
      .from('departments')
      .insert([{
        organization_id: orgId,
        name: formData.name,
        description: formData.description || null,
      }])
      .select();

    if (error) {
      alert('Erro: ' + error.message);
      return;
    }

    setDepartments([...departments, data[0]]);
    setFormData({ name: '', description: '' });
    setShowModal(false);
  };

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Carregando...</p></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Departamentos</h1>
          <p className="text-slate-400">Total: {departments.length}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
        >
          + Novo Departamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">{dept.name}</h3>
            <p className="text-slate-400 text-sm">{dept.description || 'Sem descrição'}</p>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Nenhum departamento cadastrado</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Novo Departamento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Nome *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Descrição</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" rows={3} />
              </div>
              <div className="flex gap-3">
                <button onClick={createDepartment} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Criar
                </button>
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
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
