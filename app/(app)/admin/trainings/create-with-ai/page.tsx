'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface ContentSource {
  id: string;
  title: string;
  type: string;
  category?: string;
}

interface GeneratedQuestion {
  type: string;
  statement: string;
  options: string[];
  correctAnswer: number | string;
  explanation: string;
  difficulty: string;
  points: number;
}

interface TrainingForm {
  title: string;
  description: string;
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert';
  questionCount: number;
  minPassScore: number;
  maxAttempts: number;
  contentIds: string[];
}

export default function CreateTrainingWithAIPage() {
  const router = useRouter();
  const [contents, setContents] = useState<ContentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [orgId, setOrgId] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [step, setStep] = useState<'setup' | 'preview' | 'editing'>('setup');

  const [formData, setFormData] = useState<TrainingForm>({
    title: '',
    description: '',
    difficulty: 'intermediate',
    questionCount: 10,
    minPassScore: 70,
    maxAttempts: 3,
    contentIds: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

    const { data: contentData } = await supabase
      .from('content_sources')
      .select('id, title, type, category')
      .eq('organization_id', membership.organization_id)
      .eq('status', 'published');

    if (contentData) {
      setContents(contentData);
    }
    setLoading(false);
  };

  const generateTraining = async () => {
    if (!formData.title.trim()) {
      alert('Título é obrigatório');
      return;
    }

    if (formData.contentIds.length === 0) {
      alert('Selecione pelo menos um conteúdo');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/trainings/generate-with-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          title: formData.title,
          description: formData.description,
          contentIds: formData.contentIds,
          difficulty: formData.difficulty,
          questionCount: formData.questionCount,
          minPassScore: formData.minPassScore,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar treinamento');

      setGeneratedQuestions(data.questions || []);
      setStep('preview');
    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const publishTraining = async () => {
    try {
      const response = await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty,
          minPassScore: formData.minPassScore,
          maxAttempts: formData.maxAttempts,
          maxPoints: generatedQuestions.reduce((sum, q) => sum + q.points, 0),
          questions: generatedQuestions,
          status: 'published',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao publicar');

      alert('Treinamento criado com sucesso!');
      router.push('/admin/trainings');
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...generatedQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedQuestions(updated);
  };

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Carregando...</p></div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Criar Treinamento com IA</h1>

      {step === 'setup' && (
        <div className="max-w-2xl">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="ex: Fundamentos de Venda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white h-20"
                placeholder="Descreva os objetivos do treinamento..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Dificuldade</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="basic">Básico</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                  <option value="expert">Especialista</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Qtd Perguntas</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={formData.questionCount}
                  onChange={(e) => setFormData({...formData, questionCount: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Nota Mínima (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.minPassScore}
                  onChange={(e) => setFormData({...formData, minPassScore: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Tentativas Máximas</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData({...formData, maxAttempts: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">Selecione Conteúdos *</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {contents.map((content) => (
                  <label key={content.id} className="flex items-center p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600">
                    <input
                      type="checkbox"
                      checked={formData.contentIds.includes(content.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, contentIds: [...formData.contentIds, content.id]});
                        } else {
                          setFormData({...formData, contentIds: formData.contentIds.filter(id => id !== content.id)});
                        }
                      }}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{content.title}</p>
                      <p className="text-sm text-slate-400">{content.type}</p>
                    </div>
                  </label>
                ))}
              </div>
              {contents.length === 0 && (
                <p className="text-slate-400 text-sm">Nenhum conteúdo disponível. Crie conteúdos na Base de Conhecimento.</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={generateTraining}
                disabled={generating}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? 'Gerando...' : '🤖 Gerar com IA'}
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Preview: {formData.title}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 mb-4">
              <div>Dificuldade: <span className="text-white font-medium">{formData.difficulty}</span></div>
              <div>Perguntas: <span className="text-white font-medium">{generatedQuestions.length}</span></div>
              <div>Nota Mínima: <span className="text-white font-medium">{formData.minPassScore}%</span></div>
              <div>Pontos Totais: <span className="text-white font-medium">{generatedQuestions.reduce((sum, q) => sum + q.points, 0)}</span></div>
            </div>
          </div>

          <div className="space-y-4">
            {generatedQuestions.map((question, idx) => (
              <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-white">Pergunta {idx + 1}</h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">{question.type}</span>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">{question.difficulty}</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">{question.points}pts</span>
                  </div>
                </div>

                <p className="text-slate-100 mb-3">{question.statement}</p>

                {question.options && question.options.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {question.options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded text-sm ${
                          optIdx === question.correctAnswer
                            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}) {option}
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-slate-400 text-sm mb-3">💡 {question.explanation}</p>

                <button
                  onClick={() => setStep('editing')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  ✏️ Editar pergunta
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={publishTraining}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              ✅ Publicar Treinamento
            </button>
            <button
              onClick={() => setStep('setup')}
              className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:text-white"
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {step === 'editing' && (
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-6">Editar Perguntas</h2>
          <p className="text-slate-400 mb-6">Interface de edição de perguntas em desenvolvimento...</p>
          <button
            onClick={() => setStep('preview')}
            className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:text-white"
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  );
}
