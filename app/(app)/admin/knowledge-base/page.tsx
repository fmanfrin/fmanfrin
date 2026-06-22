'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface ContentSource {
  id: string;
  title: string;
  type: string;
  category?: string;
  status: string;
  created_at: string;
  author_id?: string;
}

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [contents, setContents] = useState<ContentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'text',
    category: '',
    contentText: '',
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
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
      .from('content_sources')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContents(data);
    }
    setLoading(false);
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      return await file.text();
    }
    if (file.type === 'application/pdf') {
      return `[PDF: ${file.name} - Extração de PDF será implementada com biblioteca pdf-parse]`;
    }
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return `[DOCX: ${file.name} - Extração de DOCX será implementada com biblioteca docx]`;
    }
    return `[Arquivo: ${file.name} - Tipo não suportado para extração automática]`;
  };

  const createContent = async () => {
    if (!formData.title.trim()) {
      alert('Título é obrigatório');
      return;
    }

    let contentText = formData.contentText;
    let filePath = null;

    if (uploadFile) {
      contentText = await extractTextFromFile(uploadFile);

      const fileName = `${Date.now()}-${uploadFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('content-files')
        .upload(`${orgId}/${fileName}`, uploadFile);

      if (uploadError) {
        alert('Erro ao fazer upload: ' + uploadError.message);
        return;
      }
      filePath = fileName;
    }

    const { data, error } = await supabase
      .from('content_sources')
      .insert([{
        organization_id: orgId,
        title: formData.title,
        type: uploadFile ? uploadFile.type : formData.type,
        category: formData.category || null,
        content_text: contentText,
        file_path: filePath,
        status: 'published',
        version: 1,
      }])
      .select();

    if (error) {
      alert('Erro ao criar conteúdo: ' + error.message);
      return;
    }

    setContents([data[0], ...contents]);
    setFormData({ title: '', type: 'text', category: '', contentText: '' });
    setUploadFile(null);
    setShowCreateModal(false);
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este conteúdo?')) return;

    const { error } = await supabase
      .from('content_sources')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao deletar: ' + error.message);
      return;
    }

    setContents(contents.filter(c => c.id !== id));
  };

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Carregando...</p></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Base de Conhecimento</h1>
          <p className="text-slate-400">Total: {contents.length}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          + Novo Conteúdo
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Título</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Tipo</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Categoria</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Data</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-200">Ações</th>
            </tr>
          </thead>
          <tbody>
            {contents.map((content) => (
              <tr key={content.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <td className="px-6 py-4 text-slate-100 font-medium">{content.title}</td>
                <td className="px-6 py-4 text-slate-400">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                    {content.type === 'text/plain' ? 'TXT' : content.type === 'text/markdown' ? 'MD' : content.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{content.category || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${content.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                    {content.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {new Date(content.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => deleteContent(content.id)}
                    className="px-3 py-1 bg-red-500/20 text-red-300 rounded text-xs hover:bg-red-500/30"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Nenhum conteúdo cadastrado</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Adicionar Conteúdo
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Novo Conteúdo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="text">Texto</option>
                  <option value="application/pdf">PDF</option>
                  <option value="text/markdown">Markdown</option>
                  <option value="url">URL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Categoria</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="ex: Vendas, Produto"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Upload de Arquivo</label>
                <input
                  type="file"
                  onChange={(e) => {
                    setUploadFile(e.target.files?.[0] || null);
                    if (e.target.files?.[0]) {
                      setFormData({...formData, title: e.target.files[0].name.split('.')[0]});
                    }
                  }}
                  className="w-full text-slate-300"
                />
              </div>
              {!uploadFile && (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Ou Digite o Conteúdo</label>
                  <textarea
                    value={formData.contentText}
                    onChange={(e) => setFormData({...formData, contentText: e.target.value})}
                    placeholder="Cole o conteúdo aqui..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white h-24"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={createContent}
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
