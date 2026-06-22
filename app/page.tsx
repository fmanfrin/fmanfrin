import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="relative">
        {/* Header */}
        <header className="border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  E
                </div>
                <span className="text-2xl font-bold text-white">Elevare</span>
              </div>
              <nav className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-200 hover:text-white transition"
                >
                  Entrar
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition"
                >
                  Começar Grátis
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Plataforma SaaS de{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Treinamentos Corporativos
              </span>
            </h1>

            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Transforme conhecimento corporativo em treinamentos interativos com IA.
              Gamificação, rankings, competições e certificados em uma plataforma multi-tenant escalável.
            </p>

            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition inline-block"
              >
                Começar Agora
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border border-slate-500 text-slate-200 rounded-lg font-semibold hover:border-slate-300 hover:text-white transition inline-block"
              >
                Demo
              </Link>
            </div>

            {/* Status */}
            <div className="mt-16 p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm max-w-2xl mx-auto">
              <div className="space-y-3 text-left">
                <h3 className="text-lg font-semibold text-white">Status do Projeto</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    ✅ Fase 1: Fundação SaaS (Supabase, Auth, Database)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    Fase 2: Colaboradores e Organizações
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    Fase 3-13: Recursos completos (treinamentos, IA, gamificação, competições)
                  </li>
                </ul>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
              {[
                { icon: '🏢', title: 'Multi-Tenant', desc: 'Empresas isoladas com seus dados' },
                { icon: '🤖', title: 'Geração com IA', desc: 'Crie treinamentos de forma automática' },
                { icon: '🎮', title: 'Gamificação', desc: 'Rankings, níveis, badges e competições' },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-700/50 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-400 text-sm">
            <p>Elevare Treinamentos © 2024. Plataforma em desenvolvimento.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
