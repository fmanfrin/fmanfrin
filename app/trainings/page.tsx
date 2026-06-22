"use client";
import { useEffect, useState } from "react";

interface Training { id: string; title: string; description: string; created_at: string; }

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/training").then(r => r.json()).then(d => { setTrainings(d); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📚 Treinamentos Disponíveis</h1>
          <p className="text-gray-500 mt-1">Selecione um treinamento para começar</p>
        </div>
        <a href="/admin" className="btn-secondary">+ Adicionar</a>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card h-36 animate-pulse bg-gray-100" />)}
        </div>
      ) : trainings.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-semibold text-gray-700 text-lg">Nenhum treinamento ainda</h3>
          <p className="text-gray-400 mt-1">Acesse o painel admin para adicionar conteúdo</p>
          <a href="/admin" className="btn-primary mt-4 inline-block">Ir para Admin</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainings.map(t => (
            <a key={t.id} href={`/trainings/${t.id}`}
              className="card hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer block">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📖</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{t.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <span>🧠 10 questões</span>
                    <span>•</span>
                    <span>⭐ Até 70 pts</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-400">{new Date(t.created_at).toLocaleDateString("pt-BR")}</span>
                <span className="text-blue-600 font-medium">Iniciar →</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
