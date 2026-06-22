'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: string;
  type: string;
  statement: string;
  options?: string[];
  difficulty: string;
  points: number;
  position: number;
}

interface Training {
  id: string;
  title: string;
  description: string;
  estimatedDurationMinutes: number;
  timeLimitMinutes?: number;
  maxPoints: number;
  questions: Question[];
}

interface Attempt {
  id: string;
  training_id: string;
  started_at: string;
}

export default function TrainingAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const trainingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [training, setTraining] = useState<Training | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const startAttempt = async () => {
      try {
        const response = await fetch('/api/training-attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainingId,
            employeeId: 'demo-employee-id', // TODO: Get from context
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to start training');
        }

        const data = await response.json();
        setAttempt(data.attempt);
        setTraining(data.training);

        // Initialize time
        if (data.training.timeLimitMinutes) {
          setTimeLeft(data.training.timeLimitMinutes * 60);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start training');
      } finally {
        setLoading(false);
      }
    };

    startAttempt();
  }, [trainingId]);

  // Timer effect
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando Treinamento...</h2>
          <p className="text-gray-600">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/app/trainings"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Voltar aos Treinamentos
          </Link>
        </div>
      </div>
    );
  }

  if (!training || !attempt) {
    return null;
  }

  const question = training.questions[currentQuestion];
  const totalQuestions = training.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerChange = (value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/training-attempts/${attempt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: training.questions.map((q) => ({
            questionId: q.id,
            isCorrect: false, // TODO: Calculate based on answers
            pointsAwarded: 0, // TODO: Calculate based on answers
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit training');
      }

      const result = await response.json();
      router.push(`/trainings/${trainingId}/result?attemptId=${attempt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">{training.title}</h1>
            {timeLeft !== null && (
              <div
                className={`text-2xl font-mono font-bold ${
                  timeLeft < 300 ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {formatTime(timeLeft)}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Questão {currentQuestion + 1} de {totalQuestions}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                {question.type === 'multiple_choice' ? 'Múltipla Escolha' : 'Pergunta'}
              </span>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded">
                {question.points} pontos
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.statement}</h2>

            {/* Answer Input */}
            <div className="space-y-3">
              {question.type === 'multiple_choice' && question.options ? (
                <>
                  {question.options.map((option, idx) => (
                    <label key={idx} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="answer"
                        value={idx}
                        checked={answers[question.id] === idx}
                        onChange={(e) => handleAnswerChange(parseInt(e.target.value))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-3 text-gray-900">{option}</span>
                    </label>
                  ))}
                </>
              ) : question.type === 'true_false' ? (
                <>
                  {['Verdadeiro', 'Falso'].map((option, idx) => (
                    <label key={idx} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="answer"
                        value={idx === 0 ? 'true' : 'false'}
                        checked={answers[question.id] === (idx === 0 ? 'true' : 'false')}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-3 text-gray-900">{option}</span>
                    </label>
                  ))}
                </>
              ) : question.type === 'short_answer' ? (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Sua resposta aqui..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Sua resposta dissertativa aqui..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 pt-8 border-t border-gray-200">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>

            <div className="flex-1"></div>

            {currentQuestion < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Próxima →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : '✅ Enviar Treinamento'}
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 Dica:</p>
          <p>Suas respostas são salvas automaticamente. Você pode navegar entre questões antes de enviar.</p>
        </div>
      </div>
    </div>
  );
}
