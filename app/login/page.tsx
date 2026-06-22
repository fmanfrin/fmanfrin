'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement actual authentication
      console.log('Login with:', { email, password });
      setError('Autenticação não está implementada ainda. Próxima fase!');
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
              E
            </div>
            <h1 className="text-2xl font-bold text-white">Elevare</h1>
            <p className="text-slate-400 text-sm mt-2">Plataforma de Treinamentos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-400 text-sm">
            Não tem conta?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300">
              Crie uma aqui
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <Link
              href="/forgot-password"
              className="block text-center text-slate-400 hover:text-slate-300 text-sm"
            >
              Esqueceu a senha?
            </Link>
          </div>

          {/* Demo Info */}
          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/50">
            <p className="text-xs text-slate-300">
              <strong>Status:</strong> Página de login em desenvolvimento. Autenticação será implementada na Fase 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
