'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TrainingResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = searchParams.get('attemptId');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attemptId) {
      setError('No attempt ID provided');
      return;
    }

    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/training-attempts/${attemptId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch result');
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching result');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-6">{error || 'Resultado não encontrado'}</p>
          <Link
            href="/app/dashboard"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isApproved = result.percentage_score >= 70;
  const score = result.score || 0;
  const maxScore = result.max_score || 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Result Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div
            className={`p-8 text-white text-center ${
              isApproved ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
          >
            <div className="text-6xl mb-4">{isApproved ? '✅' : '❌'}</div>
            <h1 className="text-3xl font-bold mb-2">
              {isApproved ? 'Parabéns!' : 'Não Aprovado'}
            </h1>
            <p className="text-lg opacity-90">
              {isApproved
                ? 'Você completou o treinamento com sucesso!'
                : 'Tente novamente para alcançar a nota mínima'}
            </p>
          </div>

          {/* Score */}
          <div className="p-8 space-y-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {Math.round(result.percentage_score)}%
              </div>
              <p className="text-gray-600 mb-6">
                {score} de {maxScore} pontos
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    isApproved ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (score / maxScore) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Nota Mínima</p>
                <p className="text-2xl font-bold text-gray-900">70%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Sua Nota</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(result.percentage_score)}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isApproved ? '✅' : '❌'}
                </p>
              </div>
            </div>

            {isApproved && (
              <div className="p-6 rounded-lg bg-green-50 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">🎉 Conquistas Desbloqueadas</h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>✅ Primeiro Treinamento Concluído</li>
                  <li>⭐ Nota Máxima (100%)</li>
                  <li>🏆 Novos pontos adicionados ao seu perfil</li>
                </ul>
              </div>
            )}

            {!isApproved && (
              <div className="p-6 rounded-lg bg-blue-50 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Próximos Passos</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Revise o material novamente</li>
                  <li>• Você tem mais tentativas disponíveis</li>
                  <li>• Tente novamente para alcançar 70%</li>
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <Link
                href="/app/trainings"
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-center hover:bg-blue-700 transition"
              >
                Ver Outros Treinamentos
              </Link>
              {!isApproved && (
                <button
                  onClick={() => router.back()}
                  className="block w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium text-center hover:bg-blue-50 transition"
                >
                  Tentar Novamente
                </button>
              )}
              <Link
                href="/app/dashboard"
                className="block w-full px-6 py-3 text-center text-gray-600 hover:text-gray-900 transition"
              >
                Voltar ao Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Certificate (if approved) */}
        {isApproved && (
          <div className="mt-8 text-center">
            <button className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition shadow-lg">
              📜 Baixar Certificado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
