'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [org, setOrg] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwdConf, setPwdConf] = useState('');

  const next = () => {
    if (!org.trim()) {
      setErr('Nome da empresa obrigatório');
      return;
    }
    setErr('');
    setPage(1);
  };

  const submit = async () => {
    if (!name.trim() || !email.trim() || !pwd.trim()) {
      setErr('Preencha todos os campos');
      return;
    }
    if (pwd.length < 8) {
      setErr('Senha mín 8 caracteres');
      return;
    }
    if (pwd !== pwdConf) {
      setErr('Senhas não coincidem');
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
          admin: { name, email, password: pwd },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/login?ok=1');
    } catch (e: any) {
      setErr(e.message || 'Erro');
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

        {page === 0 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Empresa</label>
              <input type="text" value={org} onChange={(e) => setOrg(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500" placeholder="Sua Empresa" />
            </div>
            {err && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm">{err}</div>}
            <button onClick={next} className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition">Próximo</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/50 text-blue-200 text-sm">Empresa: <strong>{org}</strong></div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Nome</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500" placeholder="Seu Nome" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Senha</label>
              <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Confirmar</label>
              <input type="password" value={pwdConf} onChange={(e) => setPwdConf(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>
            {err && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm">{err}</div>}
            <button onClick={submit} disabled={loading} className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50">{loading ? 'Criando...' : 'Criar'}</button>
            <button onClick={() => setPage(0)} className="w-full px-4 py-2 border border-slate-500 text-slate-200 rounded-lg font-semibold hover:border-slate-300">Voltar</button>
          </div>
        )}

        <div className="mt-6 text-center text-slate-400 text-sm">Já tem conta? <Link href="/login" className="text-blue-400 hover:text-blue-300">Entrar</Link></div>
      </div>
    </div>
  );
}
