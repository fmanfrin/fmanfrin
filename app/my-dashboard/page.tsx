'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyDashboardPage() {
  const [orgName, setOrgName] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrgName(localStorage.getItem('org_name') || 'Organização');
      setUserName(localStorage.getItem('user_name') || 'Usuário');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">E</div>
            <span className="text-xl font-bold text-white">Elevare</span>
          </div>
          <button className="px-4 py-2 text-slate-200 hover:text-white transition">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo, {userName}! 👋</h1>
          <p className="text-slate-400">Organização: <span className="font-semibold text-slate-200">{orgName}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-2">👥 Colaboradores</p>
            <p className="text-3xl font-bold text-white">0</p>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-2">📚 Treinamentos</p>
            <p className="text-3xl font-bold text-white">0</p>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-2">🎯 Competições</p>
            <p className="text-3xl font-bold text-white">0</p>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <p className="text-slate-400 text-sm mb-2">🏆 Pontos Totais</p>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">🎉 Parabéns!</h2>
          <p className="text-blue-200 mb-4">
            Sua plataforma Elevare está pronta. Agora você pode:
          </p>
          <ul className="text-blue-200 space-y-2 mb-6">
            <li>✅ Cadastrar colaboradores</li>
            <li>✅ Criar treinamentos com IA</li>
            <li>✅ Lançar competições</li>
            <li>✅ Acompanhar desempenho</li>
          </ul>
          <p className="text-blue-300 text-sm">
            🔬 Esta é uma versão de demonstração sem autenticação real.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            ➕ Criar Nova Organização
          </Link>
        </div>
      </main>
    </div>
  );
}
