"use client";
import { useState } from "react";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ id: string; questionsCount: number; title: string } | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"text" | "file">("text");

  const EXAMPLE_CONTENT = `# Fundamentos de Segurança da Informação

## 1. Conceitos Básicos
A segurança da informação é a proteção de dados contra acesso não autorizado, alteração, divulgação ou destruição.

## 2. Principais Ameaças
- **Phishing**: e-mails falsos para roubar credenciais
- **Ransomware**: sequestra dados e exige resgate
- **Engenharia Social**: manipulação psicológica de pessoas

## 3. Boas Práticas
- Use senhas fortes (mínimo 12 caracteres, com maiúsculas, números e símbolos)
- Ative autenticação em dois fatores (2FA) em todos os serviços
- Nunca clique em links suspeitos ou abra anexos desconhecidos
- Mantenha software sempre atualizado

## 4. Política de Senhas
- Troque senhas a cada 90 dias
- Nunca reutilize senhas antigas
- Use um gerenciador de senhas

## 5. Resposta a Incidentes
Se suspeitar de um incidente, comunique imediatamente ao time de TI.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Título obrigatório"); return; }
    if (!content.trim() && !file) { setError("Forneça conteúdo ou um arquivo"); return; }

    setLoading(true);
    setError("");
    setSuccess(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("userId", "admin");
    if (file) formData.append("file", file);
    else formData.append("content", content);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar treinamento");
      setSuccess(data);
      setTitle(""); setContent(""); setFile(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">⚙️ Painel Admin</h1>
        <p className="text-gray-500 mt-1">Adicione conteúdo e a IA criará o treinamento automaticamente</p>
      </div>

      {success && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-green-800">Treinamento criado com sucesso!</p>
              <p className="text-sm text-green-700 mt-1">
                <strong>"{success.title}"</strong> — {success.questionsCount} questões geradas
              </p>
              <a href={`/trainings/${success.id}`} className="text-green-700 underline text-sm mt-1 inline-block">
                Ver treinamento →
              </a>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título do Treinamento *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Segurança da Informação"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        {/* Tabs */}
        <div>
          <div className="flex border-b border-gray-200 mb-4">
            {(["text", "file"] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t
                  ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                {t === "text" ? "📝 Texto" : "📄 Arquivo"}
              </button>
            ))}
          </div>

          {tab === "text" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Conteúdo do Treinamento *</label>
                <button type="button" onClick={() => setContent(EXAMPLE_CONTENT)}
                  className="text-xs text-blue-600 hover:underline">Usar exemplo</button>
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={14}
                placeholder="Cole aqui o conteúdo que a IA usará para criar o treinamento e as perguntas..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y" />
              <p className="text-xs text-gray-400">{content.length} caracteres. Suporta Markdown.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Arquivo de Conteúdo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <input type="file" accept=".txt,.md,.pdf" onChange={e => setFile(e.target.files?.[0] || null)}
                  className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📁</div>
                  {file ? (
                    <p className="text-blue-600 font-medium">{file.name}</p>
                  ) : (
                    <>
                      <p className="font-medium text-gray-700">Clique para selecionar</p>
                      <p className="text-sm text-gray-400 mt-1">TXT, MD ou PDF (max 10MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
          <strong>🤖 Como funciona:</strong> A IA (Claude Opus) irá analisar o conteúdo e criar automaticamente
          um resumo estruturado + 10 questões de múltipla escolha com gabarito e explicações.
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚙️</span> Gerando treinamento com IA...
            </span>
          ) : "🚀 Criar Treinamento com IA"}
        </button>
      </form>
    </div>
  );
}
