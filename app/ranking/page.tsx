"use client";
import { useEffect, useState } from "react";

interface RankEntry {
  rank: number; id: string; name: string; totalPoints: number;
  levelInfo: { level: number; name: string; icon: string };
  streak: number; badges: { id: string; name: string; icon: string }[];
  trainingsCompleted: number; avgScore: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ranking").then(r => r.json()).then(d => { setRanking(d); setLoading(false); });
  }, []);

  const medals = ["🥇", "🥈", "🥉"];
  const rowColors = ["bg-yellow-50 border-yellow-200", "bg-gray-50 border-gray-200", "bg-orange-50 border-orange-200"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🏆 Ranking Geral</h1>
        <p className="text-gray-500 mt-1">Os melhores desempenhos da plataforma</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
        </div>
      ) : ranking.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🏆</div>
          <p>Nenhuma pontuação ainda. Comece um treinamento!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranking.map((r) => (
            <div key={r.id}
              className={`card border flex items-center gap-4 transition-all hover:shadow-md
                ${r.rank <= 3 ? rowColors[r.rank - 1] : "border-gray-100"}`}>
              {/* Rank */}
              <div className="w-10 text-center flex-shrink-0">
                {r.rank <= 3 ? (
                  <span className="text-3xl">{medals[r.rank - 1]}</span>
                ) : (
                  <span className="text-xl font-bold text-gray-400">#{r.rank}</span>
                )}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{r.levelInfo.icon}</span>
                  <span className="font-bold text-gray-900">{r.name}</span>
                  <span className="badge bg-blue-100 text-blue-700 text-xs">{r.levelInfo.name}</span>
                  {r.streak >= 3 && <span className="badge bg-orange-100 text-orange-700">🔥 {r.streak} streak</span>}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>📚 {r.trainingsCompleted} treinamentos</span>
                  <span>🎯 Média: {r.avgScore}%</span>
                  {r.badges.length > 0 && (
                    <span>{r.badges.slice(0, 4).map(b => b.icon).join(" ")}</span>
                  )}
                </div>
              </div>

              {/* Points */}
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-blue-600">{r.totalPoints}</div>
                <div className="text-xs text-gray-400">pontos</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card bg-blue-50 border-blue-100">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Como ganhar mais pontos?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ Complete treinamentos: até 50 pts por treinamento</li>
          <li>⭐ Nota perfeita (10/10): +20 pts bônus</li>
          <li>🔥 Streak de 3+: multiplicador de 1.2x nos pontos</li>
          <li>🏆 Suba de nível completando mais treinamentos</li>
        </ul>
      </div>
    </div>
  );
}
