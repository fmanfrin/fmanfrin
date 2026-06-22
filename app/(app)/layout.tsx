'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
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
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="text-white">Carregando...</p></div>;
  }

  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">E</div>
            <span className="text-xl font-bold text-white">Elevare</span>
          </Link>
          <button onClick={logout} className="px-4 py-2 text-slate-200 hover:text-white transition">
            Sair
          </button>
        </div>
      </header>

      <div className="flex">
        {isAdmin && (
          <aside className="w-64 border-r border-slate-700/50 bg-slate-900/50 backdrop-blur min-h-screen">
            <nav className="p-6 space-y-2">
              <Link href="/admin/employees" className={`block px-4 py-2 rounded-lg transition ${pathname === '/admin/employees' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}>
                👥 Colaboradores
              </Link>
              <Link href="/admin/departments" className={`block px-4 py-2 rounded-lg transition ${pathname === '/admin/departments' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}>
                🏢 Departamentos
              </Link>
              <Link href="/admin/knowledge-base" className={`block px-4 py-2 rounded-lg transition ${pathname === '/admin/knowledge-base' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}>
                📚 Base de Conhecimento
              </Link>
              <Link href="/admin/trainings/create-with-ai" className={`block px-4 py-2 rounded-lg transition ${pathname.startsWith('/admin/trainings') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}>
                🤖 Criar Treinamento IA
              </Link>
              <Link href="/dashboard" className={`block px-4 py-2 rounded-lg transition text-slate-300 hover:text-white`}>
                📊 Dashboard
              </Link>
            </nav>
          </aside>
        )}
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
