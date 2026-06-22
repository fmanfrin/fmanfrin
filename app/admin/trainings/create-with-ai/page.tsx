'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 'config' | 'generating' | 'preview' | 'success';

export default function CreateTrainingWithAIPage() {
  const [step, setStep] = useState<Step>('config');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [objectiveDescription, setObjectiveDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [minPassScore, setMinPassScore] = useState(70);
  const [maxPoints, setMaxPoints] = useState(100);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['multiple_choice']);
  const [selectedContents, setSelectedContents] = useState<string[]>([]);

  // Generated training
  const [generatedTraining, setGeneratedTraining] = useState<any>(null);

  const questionTypes = [
    { id: 'multiple_choice', label: 'Múltipla Escolha' },
    { id: 'true_false', label: 'Verdadeiro/Falso' },
    { id: 'short_answer', label: 'Resposta Curta' },
    { id: 'essay', label: 'Dissertativa' },
    { id: 'case_study', label: 'Estudo de Caso' },
  ];

  const toggleQuestionType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!targetAudience.trim()) {
      setError('Público-alvo é obrigatório');
      return;
    }

    if (selectedContents.length === 0) {
      setError('Selecione pelo menos um conteúdo');
      return;
    }

    if (selectedTypes.length === 0) {
      setError('Selecione pelo menos um tipo de pergunta');
      return;
    }

    setLoading(true);
    setStep('generating');

    try {
      const response = await fetch('/api/trainings/generate-with-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'demo-org-id', // TODO: Get from context
          title,
          contentIds: selectedContents,
          targetAudience,
          difficulty,
          objectiveDescription,
          questionCount,
          questionTypes: selectedTypes,
          minPassScore,
          maxPoints,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao gerar treinamento');
      }

      const data = await response.json();
      setGeneratedTraining(data);
      setStep('preview');
      setSuccess('Treinamento gerado com sucesso! Revise as perguntas antes de publicar.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar treinamento');
      setStep('config');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);

    try {
      // TODO: Implement publish logic
      setSuccess('Treinamento publicado com sucesso!');
      setStep('success');
    } catch (err) {
      setError('Erro ao publicar treinamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gerar Treinamento com IA
          </h1>
          <p className="text-gray-600 mt-2">
            Crie treinamentos automaticamente a partir de conteúdos corporativos
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between mb-12">
          {['Configuração', 'Gerando', 'Revisão', 'Sucesso'].map((label, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center ${
                idx < ['config', 'generating', 'preview', 'success'].indexOf(step)
                  ? 'opacity-100'
                  : idx === ['config', 'generating', 'preview', 'success'].indexOf(step)
                    ? 'opacity-100'
                    : 'opacity-50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 ${
                  idx <=
                  ['config', 'generating', 'preview', 'success'].indexOf(step)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </div>
          ))}
        </div>

        {/* Configuration Step */}
        {step === 'config' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Título do Treinamento *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Venda Consultiva 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Público-Alvo *
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ex: Vendedores com 1+ ano de experiência"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Objective */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Objetivo do Treinamento
                </label>
                <textarea
                  value={objectiveDescription}
                  onChange={(e) => setObjectiveDescription(e.target.value)}
                  placeholder="Descreva o objetivo principal do treinamento"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nível de Dificuldade
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="basic">Básico</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                  <option value="expert">Especialista</option>
                </select>
              </div>

              {/* Question Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Quantidade de Perguntas
                  </label>
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Math.max(3, parseInt(e.target.value)))}
                    min={3}
                    max={50}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nota Mínima (%)
                  </label>
                  <input
                    type="number"
                    value={minPassScore}
                    onChange={(e) => setMinPassScore(Math.max(0, Math.min(100, parseInt(e.target.value))))}
                    min={0}
                    max={100}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Pontos Máximos
                  </label>
                  <input
                    type="number"
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(Math.max(1, parseInt(e.target.value)))}
                    min={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Tipos de Perguntas *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {questionTypes.map((type) => (
                    <label
                      key={type.id}
                      className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type.id)}
                        onChange={() => toggleQuestionType(type.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Content Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Conteúdos para Usar *
                </label>
                <div className="border border-gray-300 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Selecione conteúdos da Base de Conhecimento. (Lista carregada da API)
                  </p>
                  <div className="space-y-2">
                    {['content-1', 'content-2', 'content-3'].map((id) => (
                      <label key={id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedContents.includes(id)}
                          onChange={(e) => {
                            setSelectedContents((prev) =>
                              e.target.checked ? [...prev, id] : prev.filter((c) => c !== id)
                            );
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Conteúdo Exemplo ({id})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  ❌ {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Gerando...' : '🤖 Gerar Treinamento com IA'}
                </button>
                <Link
                  href="/admin/trainings"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </Link>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Como Funciona</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Selecione conteúdos da Base de Conhecimento</li>
                <li>✅ Configure os parâmetros do treinamento</li>
                <li>✅ IA gerará perguntas baseadas no conteúdo</li>
                <li>✅ Revise e edite antes de publicar</li>
              </ul>
            </div>
          </div>
        )}

        {/* Generating Step */}
        {step === 'generating' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center space-y-6">
            <div className="text-6xl animate-pulse">🤖</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Gerando Treinamento...
            </h2>
            <p className="text-gray-600">
              Aguarde enquanto a IA cria perguntas e conteúdo personalizado
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full animate-pulse"
                style={{ width: '65%' }}
              ></div>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && generatedTraining && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {generatedTraining.training.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {generatedTraining.training.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Perguntas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {generatedTraining.questions.length}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Duração</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {generatedTraining.generationDetails.estimatedDuration}m
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Pontos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {generatedTraining.training.max_points}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Nota Mínima</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {generatedTraining.training.min_pass_score}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Objetivos de Aprendizagem</h3>
                <ul className="space-y-2">
                  {generatedTraining.training.learning_objectives?.map(
                    (obj: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-gray-700">
                        <span className="text-blue-600 font-bold">{idx + 1}.</span>
                        {obj}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Questions Preview */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Perguntas ({generatedTraining.questions.length})
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedTraining.questions.slice(0, 3).map((q: any, idx: number) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded bg-gray-50">
                      <p className="font-medium text-gray-900 mb-2">
                        {idx + 1}. {q.statement.substring(0, 80)}...
                      </p>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {q.type}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {q.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          {q.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                  {generatedTraining.questions.length > 3 && (
                    <p className="text-sm text-gray-600 text-center py-2">
                      ... e {generatedTraining.questions.length - 3} mais perguntas
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Publicando...' : '✅ Publicar Treinamento'}
                </button>
                <button
                  onClick={() => setStep('config')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center space-y-6">
            <div className="text-6xl">✅</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Treinamento Publicado!
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Seu treinamento foi publicado com sucesso e está pronto para ser atribuído aos
              colaboradores.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/admin/trainings"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Ver Treinamentos
              </Link>
              <button
                onClick={() => {
                  setStep('config');
                  setTitle('');
                  setTargetAudience('');
                  setObjectiveDescription('');
                  setSelectedContents([]);
                  setGeneratedTraining(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Criar Outro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
