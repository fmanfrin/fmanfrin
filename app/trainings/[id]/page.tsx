"use client";
import { useEffect, useState, use } from "react";
import ReactMarkdown from "react-markdown";

interface Question {
  id: number; question: string; options: string[]; correct: number; explanation: string;
}
interface Training { id: string; title: string; content: string; questions: Question[]; }
interface User { id: string; name: string; email: string; role: string; }
interface QuizResult {
  score: number; maxScore: number; pct: number;
  results: { question: string; userAnswer: number; correct: number; isCorrect: boolean; explanation: string }[];
  pointsEarned: number; totalPoints: number; newBadges: { id: string; name: string; icon: string; desc: string }[];
  levelInfo: { level: number; name: string; icon: string }; feedback: string; streak: number;
}

type Phase = "user-select" | "content" | "quiz" | "result";

export default function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [training, setTraining] = useState<Training | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [phase, setPhase] = useState<Phase>("user-select");
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/training/${id}`).then(r => r.json()).then(setTraining);
    fetch("/api/users").then(r => r.json()).then(setUsers);
  }, [id]);

  const startQuiz = () => {
    if (!selectedUser) return;
    setAnswers(new Array(training!.questions.length).fill(-1));
    setCurrent(0);
    setPhase("content");
  };

  const submitQuiz = async () => {
    setLoading(true);
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser, trainingId: id, answers }),
    });
    const data = await res.json();
    setResult(data);
    setPhase("result");
    setLoading(false);
  };

  if (!training) return <div className="card text-center py-16 animate-pulse text-gray-400">Carregando...</div>;

  if (phase === "user-select") return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{training.title}</h1>
        <p className="text-gray-500 mt-1">Selecione quem está fazendo o treinamento</p>
      </div>
      <div className="card space-y-4">
        <label className="block text-sm font-medium text-gray-700">Participante</label>
        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Selecione...</option>
          {users.filter(u => u.role === "trainee").map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <div className="flex gap-3 pt-2">
          <a href="/trainings" className="btn-secondary flex-1 text-center">← Voltar</a>
          <button onClick={startQuiz} disabled={!selectedUser} className="btn-primary flex-1">Começar</button>
        </div>
      </div>
    </div>
  );

  if (phase === "content") return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{training.title}</h1>
        <span className="badge bg-blue-100 text-blue-700">📖 Leitura</span>
      </div>
      <div className="card prose prose-sm max-w-none">
        <ReactMarkdown>{training.content}</ReactMarkdown>
      </div>
      <div className="flex justify-end">
        <button onClick={() => setPhase("quiz")} className="btn-primary">
          Iniciar Quiz (10 questões) →
        </button>
      </div>
    </div>
  );

  if (phase === "quiz") {
    const q = training.questions[current];
    const progress = ((current) / training.questions.length) * 100;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Questão {current + 1} de {training.questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="card space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">{q.question}</h2>
          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button key={idx} onClick={() => {
                const newAnswers = [...answers]; newAnswers[current] = idx; setAnswers(newAnswers);
              }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm
                  ${answers[current] === idx
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {current > 0 && (
            <button onClick={() => setCurrent(c => c - 1)} className="btn-secondary flex-1">← Anterior</button>
          )}
          {current < training.questions.length - 1 ? (
            <button onClick={() => setCurrent(c => c + 1)} disabled={answers[current] === -1}
              className="btn-primary flex-1">Próxima →</button>
          ) : (
            <button onClick={submitQuiz} disabled={answers.some(a => a === -1) || loading}
              className="btn-primary flex-1">
              {loading ? "Calculando..." : "✅ Finalizar Quiz"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    const color = result.pct >= 80 ? "green" : result.pct >= 60 ? "yellow" : "red";
    const colorMap = { green: "text-green-600 bg-green-50", yellow: "text-yellow-600 bg-yellow-50", red: "text-red-600 bg-red-50" };
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Score card */}
        <div className={`card text-center ${colorMap[color]}`}>
          <div className="text-6xl font-bold">{result.pct}%</div>
          <div className="text-xl font-semibold mt-2">{result.score}/{result.maxScore} acertos</div>
          <div className="mt-3 text-sm font-medium">{result.feedback}</div>
        </div>

        {/* Points & badges */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600">+{result.pointsEarned}</div>
            <div className="text-sm text-gray-500">Pontos ganhos</div>
            <div className="text-xs text-gray-400 mt-1">Total: {result.totalPoints} pts</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl">{result.levelInfo.icon}</div>
            <div className="text-sm font-semibold text-gray-700">{result.levelInfo.name}</div>
            <div className="text-xs text-gray-400 mt-1">🔥 Streak: {result.streak}</div>
          </div>
        </div>

        {result.newBadges.length > 0 && (
          <div className="card bg-yellow-50 border-yellow-200">
            <h3 className="font-bold text-yellow-800 mb-3">🎉 Conquistas Desbloqueadas!</h3>
            <div className="flex flex-wrap gap-2">
              {result.newBadges.map(b => (
                <div key={b.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-yellow-300 shadow-sm">
                  <span className="text-xl">{b.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{b.name}</div>
                    <div className="text-xs text-gray-500">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question review */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">📋 Revisão das Questões</h3>
          {result.results.map((r, i) => (
            <div key={i} className={`card border-l-4 ${r.isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
              <div className="flex items-start gap-2">
                <span>{r.isCorrect ? "✅" : "❌"}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{r.question}</p>
                  <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded p-2">{r.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <a href="/trainings" className="btn-secondary flex-1 text-center">← Mais Treinamentos</a>
          <a href="/ranking" className="btn-primary flex-1 text-center">🏆 Ver Ranking</a>
        </div>
      </div>
    );
  }

  return null;
}
