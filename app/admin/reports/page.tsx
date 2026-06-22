'use client';

import { useState } from 'react';
import { Download, FileText, BarChart3 } from 'lucide-react';

type ReportType =
  | 'employee_performance'
  | 'training_performance'
  | 'department_performance'
  | 'ranking'
  | 'points_history'
  | 'badges_earned'
  | 'completion_rate';

interface ReportOption {
  id: ReportType;
  name: string;
  description: string;
  icon: string;
}

const reportOptions: ReportOption[] = [
  {
    id: 'employee_performance',
    name: 'Desempenho de Colaboradores',
    description: 'Análise completa de cada colaborador: pontos, treinamentos, média de desempenho',
    icon: '👤',
  },
  {
    id: 'training_performance',
    name: 'Desempenho de Treinamentos',
    description: 'Análise de cada treinamento: conclusões, notas médias, taxa de aprovação',
    icon: '📚',
  },
  {
    id: 'ranking',
    name: 'Ranking Geral',
    description: 'Posição de todos os colaboradores ordenados por pontos',
    icon: '🏆',
  },
  {
    id: 'points_history',
    name: 'Histórico de Pontos',
    description: 'Registro cronológico de todos os eventos de pontos atribuídos',
    icon: '📊',
  },
  {
    id: 'badges_earned',
    name: 'Badges Conquistadas',
    description: 'Lista completa de badges conquistadas por colaborador',
    icon: '🎖️',
  },
  {
    id: 'completion_rate',
    name: 'Taxa de Conclusão',
    description: 'Análise de conclusão por treinamento: atribuídos vs completos',
    icon: '✅',
  },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleGenerateReport() {
    if (!selectedReport) {
      setError('Selecione um relatório');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: selectedReport,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao gerar relatório');
      }

      // Download CSV
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Relatório baixado com sucesso!');
      setSelectedReport(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
    } finally {
      setIsLoading(false);
    }
  }

  const selectedOption = reportOptions.find((r) => r.id === selectedReport);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            📋 Relatórios
          </h1>
          <p className="text-gray-600">
            Gere relatórios em CSV para análise e compartilhamento de dados
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-800">✓ {success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Selecione um Relatório</h2>
            <div className="space-y-4">
              {reportOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedReport(option.id)}
                  className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                    selectedReport === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{option.name}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    {selectedReport === option.id && (
                      <div className="flex-shrink-0 text-blue-600">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                          ✓
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview and Generate */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Gerar Relatório</h2>

              {selectedOption ? (
                <div className="space-y-6">
                  {/* Preview */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Relatório Selecionado:</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <span>{selectedOption.icon}</span>
                      {selectedOption.name}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Formato:</span> CSV
                    </p>
                    <p className="text-sm text-blue-900 mt-1">
                      <span className="font-semibold">Compatível com:</span> Excel, Google Sheets,
                      etc
                    </p>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    {isLoading ? 'Gerando...' : 'Baixar Relatório'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm">Selecione um relatório para começar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Dicas para Uso dos Relatórios
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <span>
                <strong>Desempenho:</strong> Use para monitorar progresso de colaboradores e
                treinamentos
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <span>
                <strong>Rankings:</strong> Compartilhe com lideranças para visualizar posições
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <span>
                <strong>Histórico:</strong> Analise tendências e evolução ao longo do tempo
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">4.</span>
              <span>
                <strong>CSV:</strong> Importe em Excel/Sheets para análises customizadas
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
