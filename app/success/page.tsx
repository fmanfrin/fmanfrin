'use client';
import Link from 'next/link';

export default function SuccessPage() {
  const orgName = typeof window !== 'undefined' ? localStorage.getItem('org_name') : '';
  const userName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">✅</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Conta Criada!</h1>
        <p className="text-slate-300 mb-8">Sua organização foi criada com sucesso.</p>

        <div className="bg-slate-800 rounded-lg p-6 mb-6 text-left space-y-2">
          <p className="text-slate-400 text-sm">
            <span className="text-slate-300 font-semibold">Empresa:</span> {orgName}
          </p>
          <p className="text-slate-400 text-sm">
            <span className="text-slate-300 font-semibold">Admin:</span> {userName}
          </p>
        </div>

        <Link
          href="/my-dashboard"
          className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Acessar Dashboard →
        </Link>
      </div>
    </div>
  );
}
