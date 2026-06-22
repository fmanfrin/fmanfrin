'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        setError('Arquivo excede 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!file || !title) {
      setError('Arquivo e título são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('tags', tags);
      formData.append('organizationId', 'demo-org-id'); // TODO: get from context

      // TODO: Implement actual upload
      console.log('Upload:', { file: file.name, title, description });
      setSuccess('Funcionalidade de upload em desenvolvimento. Próxima fase!');
    } catch (err) {
      setError('Erro ao fazer upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Base de Conhecimento</h1>
          <p className="text-gray-600 mt-2">
            Gerencie conteúdos corporativos para geração automática de treinamentos
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`pb-4 font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📚 Conteúdos
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-4 font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📤 Enviar Novo
            </button>
          </div>
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum conteúdo ainda
              </h2>
              <p className="text-gray-600 mb-6">
                Comece a adicionar materiais de treinamento para sua organização
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Enviar Conteúdo
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                ℹ️ Tipos de Arquivo Suportados
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ <strong>TXT</strong> - Arquivos de texto simples</li>
                <li>✅ <strong>Markdown (.md)</strong> - Texto formatado</li>
                <li>✅ <strong>PDF</strong> - Documentos (requer biblioteca adicional)</li>
                <li>✅ <strong>DOCX</strong> - Word (requer biblioteca adicional)</li>
                <li>✅ <strong>PPTX</strong> - PowerPoint (requer biblioteca adicional)</li>
              </ul>
              <p className="text-xs text-blue-700 mt-3">
                Limite de arquivo: 10MB. Para PDFs e Office, copie o conteúdo como texto por enquanto.
              </p>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl">
            <form onSubmit={handleUpload} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Título do Conteúdo *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Manual de Vendas 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva brevemente o conteúdo"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="vendas">Vendas</option>
                  <option value="marketing">Marketing</option>
                  <option value="operacao">Operação</option>
                  <option value="rh">RH</option>
                  <option value="compliance">Compliance</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ex: vendas, produtos, negociação"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Arquivo *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".txt,.md,.pdf,.docx,.pptx"
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-gray-900 font-medium">
                      {file ? file.name : 'Selecione um arquivo'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      ou arraste e solte aqui
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Máximo 10MB (TXT, MD, PDF, DOCX, PPTX)
                    </p>
                  </label>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  ❌ {error}
                </div>
              )}

              {success && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                  ✅ {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !file || !title}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Conteúdo'}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
              <p className="font-semibold mb-2">💡 Dica:</p>
              <p>
                Conteúdos serão armazenados de forma segura e poderão ser usados para gerar
                treinamentos automaticamente com IA na próxima fase.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
