'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('ok') === '1';
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  const submit = async () => {
    if (!email.trim() || !pwd.trim()) {
      setErr('Email e senha obrigatórios');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pwd,
      });
      if (error) throw new Error(error.message);
      router.push('/dashboard');
    } catch (e: any) {
      setErr(e.message || 'Erro ao fazer login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700/50 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">E</div>
          <h1 className="text-2xl font-bold text-white">Elevare</h1>
          <p className="text-slate-400 text-sm mt-2">Plataforma de Treinamentos</p>
        </div>

        {isSuccess && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-200 text-sm mb-4">
            ✅ Conta criada com sucesso! Faça login para continuar.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Senha</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          {err && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm">{err}</div>}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <div className="mt-6 text-center text-slate-400 text-sm">
          Não tem conta? <Link href="/signup" className="text-blue-400 hover:text-blue-300">Criar conta</Link>
        </div>
      </div>
    </div>
  );
}
