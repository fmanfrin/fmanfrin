'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState('org');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [orgName, setOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  const handleNext = () => {
    if (!orgName) {
      setError('Nome da empresa é obrigatório');
      return;
    }
    setError('');
    setStep('admin');
  };

  const handleSignup = async () => {
    if (!adminName || !adminEmail || !adminPassword) {
      setError('Todos os campos são obrigatórios');
      return;
    }
    if (adminPassword !== adminPasswordConfirm) {
      setError('As senhas não correspondem');
      return;
    }
    if (adminPassword.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: { name: orgName, plan: 'basic' },
          admin: { name: adminName, email: adminEmail, password: adminPassword },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar conta');
        setLoading(false);
        return;
      }

      router.push('/login?success=true');
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
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

          {step === 'org' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Sua Empresa"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition"
              >
                Próximo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/50 text-blue-200 text-sm">
                Empresa: <strong>{orgName}</strong>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Seu Nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Senha</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Confirmar Senha</label>
                <input
                  type="password"
                  value={adminPasswordConfirm}
                  onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Conta'}
              </button>

              <button
                onClick={() => setStep('org')}
                className="w-full px-4 py-2 border border-slate-500 text-slate-200 rounded-lg font-semibold hover:border-slate-300"
              >
                Voltar
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-slate-400 text-sm">
            Já tem conta? <Link href="/login" className="text-blue-400 hover:text-blue-300">Entre aqui</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
