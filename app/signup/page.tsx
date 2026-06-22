'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type SignupStep = 'organization' | 'admin';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>('organization');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Organization
  const [orgName, setOrgName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [plan, setPlan] = useState('basic');

  // Admin
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  const handleOrgNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setError('Nome da empresa é obrigatório');
      return;
    }
    setError('');
    setStep('admin');
  };

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!adminName.trim()) {
        setError('Nome completo é obrigatório');
        setLoading(false);
        return;
      }

      if (!adminEmail.trim()) {
        setError('Email é obrigatório');
        setLoading(false);
        return;
      }

      if (adminPassword.length < 8) {
        setError('Senha deve ter no mínimo 8 caracteres');
        setLoading(false);
        return;
      }

      if (adminPassword !== adminConfirmPassword) {
        setError('As senhas não correspondem');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: { name: orgName, cnpj, plan },
          admin: { name: adminName, email: adminEmail, password: adminPassword },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta');
        setLoading(false);
        return;
      }

      // Success - redirect to login
      router.push('/login?registered=true');
    } catch (err) {
      setError('Erro ao criar conta');
      console.error(err);
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
            <p className="text-slate-400 text-sm mt-2">
              {step === 'organization' ? 'Criar Empresa' : 'Cadastrar Admin'}
            </p>
          </div>

          {step === 'organization' ? (
            <form onSubmit={handleOrgNext} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Ex: Solare Alimentos"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  CNPJ (Opcional)
                </label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Plano
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="basic">Básico</option>
                  <option value="professional">Profissional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition"
              >
                Próximo
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSignup} className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/50 text-blue-200 text-sm">
                Criando: <strong>{orgName}</strong>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Seu Nome"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="admin@empresa.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="••••••••"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Mínimo 8 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="••••••••"
                  required
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
                {loading ? 'Criando...' : 'Criar Conta'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('organization');
                  setError('');
                }}
                className="w-full px-4 py-2 border border-slate-500 text-slate-200 rounded-lg font-semibold hover:border-slate-300 transition"
              >
                Voltar
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-slate-400 text-sm">
            Já tem conta?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              Entre aqui
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
