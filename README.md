# Elevare Treinamentos - Plataforma SaaS Corporativa

## 📊 Visão Geral

**Elevare** é uma plataforma SaaS multi-tenant de treinamentos corporativos com gamificação, geração de conteúdo por IA, rankings competitivos e relatórios avançados.

## ✨ Principais Funcionalidades

✅ Autenticação Segura (Supabase Auth + JWT)
✅ Multi-Tenant com RLS (35+ policies)
✅ CRUD Colaboradores + Import CSV
✅ Base de Conhecimento (Upload PDF/DOCX)
✅ Geração de Treinamentos com IA
✅ Sistema de Quiz com Timer
✅ Gamificação (Níveis, Badges, Pontos)
✅ Rankings & Leaderboards
✅ Competições com Prêmios
✅ Dashboards Admin (KPIs)
✅ Relatórios (Export CSV)
✅ Audit Logs (Rastreamento)

## 🚀 Quick Start

```bash
git clone https://github.com/fmanfrin/elevare.git
cd elevare
npm install
cp .env.example .env.local
# Preencha variáveis Supabase e OpenAI
npm run dev
```

Acesse: http://localhost:3000

## 📋 Variáveis de Ambiente

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
OPENAI_API_KEY=sk-xxxxx
```

## 🗄️ Setup Banco de Dados

```bash
# Execute migrations em db/migrations/
# Seed demo data
npm run seed:demo
```

## 📊 Navegação

**Admin:**
- /admin/employees - Colaboradores
- /admin/departments - Departamentos
- /admin/knowledge-base - Base de Conhecimento
- /admin/trainings/create-with-ai - Gerar Treinamentos
- /admin/competitions - Competições
- /admin/reports - Relatórios
- /admin/security/audit-logs - Logs
- /admin/dashboard - Dashboard

**Colaborador:**
- /competitions - Participar
- /rankings - Ver Rankings
- /achievements - Conquistas
- /dashboard - Dashboard

## 🧪 Testes

```bash
npm run type-check
npm run lint
npm run build
```

## 🚀 Deployment

Vercel: https://fmanfrin-ni8t.vercel.app

## 📦 Stack

- Next.js 14.2.0
- React 19
- TypeScript 5.3
- Tailwind CSS 3.4
- Supabase
- OpenAI API

## 📈 Progresso

Fases: 11/13 (85%)
Build: ✅ 0 errors
Deploy: ✅ Live
Qualidade: ⭐⭐⭐⭐⭐

## 📧 Suporte

Email: fmanfrin@gmail.com
Issues: https://github.com/fmanfrin/elevare/issues

---

*Pronto para produção! 🚀*
