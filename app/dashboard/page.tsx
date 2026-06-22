'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface User {
  email?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">E</div>
            <span className="text-xl font-bold text-white">Elevare</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-slate-200 hover:text-white transition"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo ao Dashboard!</h1>
            <p className="text-slate-300">Você está autenticado como:</p>
            <p className="text-lg text-blue-400 font-semibold">{user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="text-white font-semibold mb-2">Colaboradores</h3>
              <p className="text-slate-400 text-sm">Gerencie seus funcionários</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="text-white font-semibold mb-2">Treinamentos</h3>
              <p className="text-slate-400 text-sm">Crie e gerencie treinamentos</p>
            </div>

            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="text-3xl mb-2">🎮</div>
              <h3 className="text-white font-semibold mb-2">Gamificação</h3>
              <p className="text-slate-400 text-sm">Rankings e competições</p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4">Status</h2>
            <div className="space-y-2 text-slate-300">
              <p>✅ Autenticação com Supabase funcionando</p>
              <p>✅ Sessão protegida</p>
              <p>📝 Próximos passos: Colaboradores, Treinamentos, Gamificação</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
