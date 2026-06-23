'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [org, setOrg] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org.trim() || !name.trim() || !email.trim()) {
      setErr('Preencha todos os campos');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: { name: org, plan: 'basic' },
          admin: { name, email, password: 'demo123' },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Store organization info for dashboard access
      if (typeof window !== 'undefined') {
        localStorage.setItem('org_id', data.organization.id);
        localStorage.setItem('user_name', name);
        localStorage.setItem('org_name', org);
      }

      // Redirect immediately to dashboard
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (e: any) {
      setErr(e.message || 'Erro ao criar conta');
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

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Empresa</label>
            <input
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
              placeholder="Sua Empresa"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
              placeholder="Seu Nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          {err && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm">{err}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? '⏳ Criando...' : '✨ Criar Conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">🔬 Protótipo para demonstração</p>
      </div>
    </div>
  );
}
