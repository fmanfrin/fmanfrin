# 🎓 Elevare Treinamentos - Plataforma SaaS de Treinamento Corporativo

Elevare Treinamentos é uma **plataforma SaaS completa e production-ready** para gestão de treinamentos corporativos. Permite que empresas façam upload de conteúdo, gerem automaticamente treinamentos com IA, rastreiem desempenho e engajem colaboradores através de gamificação e competições.

## ✨ Features

### 📊 Gestão Completa
- ✅ **Multi-tenant SaaS** - Isolamento total de dados por organização
- ✅ **Autenticação segura** - Supabase Auth + JWT
- ✅ **RLS (Row Level Security)** - Controle de acesso ao nível de banco de dados
- ✅ **CRUD de colaboradores** - Cadastro manual ou importação CSV
- ✅ **Áreas e departamentos** - Estrutura organizacional flexível

### 📚 Conteúdo e Treinamentos
- ✅ **Upload de arquivos** - TXT, Markdown, PDF, DOCX, PPTX
- ✅ **Base de conhecimento** - Armazenamento versionado
- ✅ **Geração com IA** - GPT-4 Turbo transforma conteúdo em treinamentos
- ✅ **5 tipos de perguntas** - Múltipla escolha, V/F, resposta curta, dissertativa, etc
- ✅ **Quiz interativo** - Timer, progresso visual, navegação fluida

### 🎮 Gamificação
- ✅ **Sistema de pontos** - Base + bonificações (perfeição, velocidade)
- ✅ **6 níveis** - Iniciante → Elite com progressão clara
- ✅ **Badges** - 5+ conquistas automáticas
- ✅ **Rankings** - Geral e por departamento
- ✅ **Competições** - Campanhas com prêmios

### 📊 Visualizações
- ✅ **Dashboard admin** - KPIs, gráficos, alertas
- ✅ **Dashboard colaborador** - Evolução pessoal
- ✅ **Relatórios CSV** - 6 tipos de exportação
- ✅ **Gráficos Recharts** - Visualizações interativas

### 🔐 Segurança
- ✅ **Rate limiting** - Proteção contra abuso
- ✅ **Audit logs** - 25+ ações rastreadas
- ✅ **Sanitização XSS** - Prevenção de attacks
- ✅ **CPF validator** - Validação robusta + hash
- ✅ **Data export logs** - LGPD compliant

## 📋 Requisitos

- Node.js 18+
- npm 9+ ou yarn 3+
- Supabase account
- OpenAI API key (opcional)

## 🚀 Quick Start

```bash
# Clone
git clone <seu-repo>
cd training-app

# Install
npm install

# Env
cp .env.example .env.local
# Edite com suas credenciais

# Dev server
npm run dev
# Acesse http://localhost:3000

# Seed demo
npm run seed:demo
```

## 📖 Estrutura de Pastas

```
app/                    # Next.js pages e API routes
components/             # React components
lib/                    # Lógica compartilhada
├── services/          # Business logic
├── security/          # Rate limiter, audit logs, sanitização
├── validations/       # Zod schemas
├── ai/               # OpenAI integration
└── types/            # TypeScript interfaces
db/                    # SQL migrations e RLS policies
scripts/              # Utility scripts (seed demo)
public/               # Static files
```

## 🎯 Principais Endpoints

```
POST   /api/employees                    # CRUD
POST   /api/trainings/generate-with-ai   # Gerar com IA
POST   /api/training-attempts            # Iniciar quiz
PATCH  /api/training-attempts/:id        # Submeter respostas
GET    /api/rankings                     # Rankings
POST   /api/reports/generate             # Exportar CSV
```

## 🔐 Variáveis de Ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

## 📊 Status do Projeto

**13 Fases - 100% Completo** ✅

| Fase | Status | Feature |
|------|--------|---------|
| 1 | ✅ | Fundação SaaS |
| 2 | ✅ | Colaboradores |
| 3 | ✅ | Base de Conhecimento |
| 4 | ✅ | Geração com IA |
| 5 | ✅ | Realização de Treinamentos |
| 6 | ✅ | Gamificação |
| 7 | ✅ | Rankings |
| 8 | ✅ | Competições |
| 9 | ✅ | Dashboards |
| 10 | ✅ | Relatórios |
| 11 | ✅ | Segurança |
| 12 | ✅ | Seed Demo |
| 13 | ✅ | Deploy & Docs |

## 🚀 Deploy em Vercel

```bash
# 1. Push para GitHub
git push origin main

# 2. Vercel.com
# - Importe repositório
# - Configure env vars
# - Deploy automático

# 3. Supabase
# - Configure CORS
# - Atualize URLs
```

## 📞 Suporte

Email: support@elevare.com

## 📝 Licença

Projeto privado © 2024

---

Desenvolvido com ❤️ para transformar treinamento corporativo
