# 🚀 GUIA COMPLETO DE DEPLOY - VERCEL

**Status:** Pronto para produção
**Tempo Estimado:** 15-30 minutos
**Dificuldade:** ⭐ Fácil

---

## 📋 PRÉ-REQUISITOS

Você precisa de:
- [ ] Conta GitHub (grátis em github.com)
- [ ] Conta Vercel (grátis em vercel.com)
- [ ] Projeto Supabase criado
- [ ] Git instalado localmente

---

## ✅ CHECKLIST PRÉ-DEPLOY

### Local
```bash
# 1. Verificar build
npm run build
# Esperado: Build bem-sucedido, sem erros

# 2. Testar localmente
npm run dev
# Esperado: App rodando em http://localhost:3000

# 3. Testar com dados demo (opcional)
npm run seed:demo
# Esperado: Seed completo sem erros

# 4. Fazer login de teste
# Email: ana@solare.com
# Esperado: Login bem-sucedido
```

### Supabase
```
[ ] Projeto criado em supabase.com
[ ] Migrations SQL executadas
[ ] RLS policies aplicadas
[ ] URL do projeto anotada
[ ] Chaves de API anotadas
```

### Variáveis de Ambiente
```
[ ] NEXT_PUBLIC_SUPABASE_URL
[ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
[ ] SUPABASE_SERVICE_ROLE_KEY
[ ] OPENAI_API_KEY (opcional)
```

---

## 🔧 PASSO 1: Preparar Repositório GitHub

### 1.1 Criar Repositório
```bash
# Se ainda não tem repositório:
cd C:\Users\manfr\claude\training-app

# Inicializar git (se não estiver)
git init
git add .
git commit -m "feat: elevare treinamentos v1.0.0 production-ready"

# Criar repositório em github.com/new
# Nome: training-app (ou outro)
# Privado ou público (sua escolha)
```

### 1.2 Conectar ao GitHub
```bash
# Adicionar remote (substitua seu-usuario/seu-repo)
git remote add origin https://github.com/seu-usuario/training-app.git

# Enviar para GitHub
git branch -M main
git push -u origin main
```

### 1.3 Verificar no GitHub
```
✓ Acessar https://github.com/seu-usuario/training-app
✓ Verificar que todos os arquivos estão lá
✓ Verificar README.md aparece
```

---

## 🌐 PASSO 2: Conectar a Vercel

### 2.1 Sign Up / Login
1. Ir para **vercel.com**
2. Click **"Sign Up"** ou **"Log In"**
3. Escolher **"Continue with GitHub"**
4. Autorizar Vercel a acessar GitHub

### 2.2 Importar Projeto
1. Click **"Add New"** → **"Project"**
2. Selecionar repositório **training-app**
3. Click **"Import"**

### 2.3 Configurar Project
```
Framework Preset: ✓ Next.js (detectado automaticamente)
Root Directory: . (root)
Build Command: npm run build (default)
Output Directory: .next (default)
Environment Variables: ⚠️ ADICIONAR PRÓXIMA ETAPA
```

---

## 🔑 PASSO 3: Adicionar Variáveis de Ambiente

### 3.1 Na Tela de Deploy
Antes de fazer deploy, adicionar cada variável:

```
Nome: NEXT_PUBLIC_SUPABASE_URL
Valor: https://seu-projeto.supabase.co
Salvar
```

```
Nome: NEXT_PUBLIC_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Salvar
```

```
Nome: SUPABASE_SERVICE_ROLE_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Salvar
```

```
Nome: OPENAI_API_KEY
Valor: sk-proj-xxxxx... (opcional, pode deixar vazio)
Salvar (se tiver chave)
```

### 3.2 Onde Encontrar as Chaves

**Supabase:**
1. Ir para **supabase.com** → seu projeto
2. Click **Settings** → **API**
3. Copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

**OpenAI:**
1. Ir para **platform.openai.com/api-keys**
2. Click **"Create new secret key"**
3. Copiar → `OPENAI_API_KEY`

---

## 🚀 PASSO 4: Fazer Deploy

### 4.1 Deploy
1. Na Vercel, você verá a tela de deploy
2. Click **"Deploy"** (botão azul)
3. Aguardar... (2-3 minutos)

### 4.2 Monitorar
```
Você verá:
✓ Building... (compilando)
✓ Functions... (otimizando)
✓ Preparing... (finalizando)
✓ Done! (concluído)
```

### 4.3 Resultado
```
Quando terminar:
✓ URL de produção: https://seu-app.vercel.app
✓ Domínio customizado: opcional
✓ SSL: automático e gratuito
✓ CDN: global e gratuito
```

---

## ✅ PASSO 5: Testar em Produção

### 5.1 Acesso Inicial
```
URL: https://seu-app.vercel.app
Esperado: Página carrega rapidamente
```

### 5.2 Teste de Login
```
1. Ir para /login
2. Email: ana@solare.com
3. Password: (reset password flow)
4. Esperado: Login bem-sucedido → Dashboard
```

### 5.3 Teste de Funcionalidades
```
[ ] Dashboard carrega e mostra dados
[ ] Ranking funciona
[ ] Pode visualizar treinamentos
[ ] Relatórios exportam CSV
[ ] Não há erros no console
[ ] Performance é boa
```

### 5.4 Monitorar Performance
```
Vercel mostra:
- Edge Network: latência global
- Serverless Functions: tempo de resposta
- Database: tempo de query
- Storage: uso de banda
```

---

## 🔒 PASSO 6: Segurança Pós-Deploy

### 6.1 Configurar CORS
**No Supabase:**
```
Settings → API → CORS
Adicionar:
https://seu-app.vercel.app
```

### 6.2 Configurar URLs de Callback
**No Supabase Auth:**
```
Settings → Auth → URLs
Redirect URLs:
https://seu-app.vercel.app/auth/callback
https://seu-app.vercel.app/login

Adicionar email confirmado para segurança
```

### 6.3 Habilitar 2FA (Recomendado)
**Na Vercel:**
```
Settings → Account → Authentication
Habilitar Two-Factor Authentication
```

### 6.4 Backup Automático (Supabase)
```
Supabase → Backups
Habilitar backup automático diário
```

---

## 📊 PASSO 7: Monitoramento Contínuo

### 7.1 Vercel Dashboard
```
Acessar: vercel.com/dashboard
Monitorar:
- Deployments (sucesso/falha)
- Build time (performance)
- Function execution (latência)
- Errors (bugs)
```

### 7.2 Supabase Dashboard
```
Acessar: supabase.com → seu projeto
Monitorar:
- Database size
- Auth users
- API calls
- Storage usage
```

### 7.3 Logs
```
Vercel Logs: vercel.com/dashboard → seu-app → Logs
Supabase Logs: supabase.com → seu-app → Logs
```

---

## 🆘 TROUBLESHOOTING

### Deploy Falha na Vercel

**Erro: "Build failed"**
```
Solução:
1. Ir para "Deployments"
2. Click na deploy que falhou
3. Ler erro na aba "Build Logs"
4. Fixar o erro e fazer push novamente
5. Deploy é automático (webhook do GitHub)
```

**Erro: "Environment variable missing"**
```
Solução:
1. Ir para Settings → Environment Variables
2. Verificar que TODAS as variáveis estão lá
3. Redeploy: Actions → Redeploy
```

### App Não Carrega

**Erro: "SUPABASE_URL missing"**
```
Solução:
1. Verificar .env.example
2. Adicionar variável em Vercel Settings
3. Redeploy
```

**Erro: "CORS blocked"**
```
Solução:
1. Supabase → Settings → API → CORS
2. Adicionar https://seu-app.vercel.app
3. Aguardar 1 minuto
4. Recarregar página
```

### Supabase Connection Fails

**Erro: "Error connecting to database"**
```
Solução:
1. Verificar que migrations foram executadas
2. Verificar RLS policies
3. Testar conexão em Supabase SQL Editor
4. Redeploy
```

---

## 📱 PASSO 8: Domínio Customizado (Opcional)

### 8.1 Adicionar Domínio
```
Vercel → seu-app → Settings → Domains
Adicionar seu domínio (ex: elevare.com.br)
```

### 8.2 Configurar DNS
```
Na registradora do seu domínio:
Adicionar CNAME:
nome: www
target: cname.vercel-dns.com

Ou usar nameservers da Vercel
```

### 8.3 Ativar SSL
```
Vercel ativa automaticamente após DNS propagar
Tempo: 24-48 horas
```

---

## 🎉 SUCESSO!

Quando você ver:

```
✅ Deploy bem-sucedido
✅ URL de produção funcionando
✅ Login funciona
✅ Dados carregam
✅ Performance boa
```

**Parabéns! Seu app está em produção! 🎊**

---

## 📞 PRÓXIMAS AÇÕES

### Hoje
- [x] Fazer deploy em Vercel
- [x] Testar em produção
- [ ] Compartilhar URL com stakeholders

### Esta Semana
- [ ] Configurar domínio customizado
- [ ] Habilitar 2FA
- [ ] Coletar feedback inicial
- [ ] Fazer ajustes conforme feedback

### Próximas Semanas
- [ ] Monitorar performance
- [ ] Coletar métricas
- [ ] Planejar features v1.1
- [ ] Comunicar roadmap

---

## 📚 DOCUMENTAÇÃO ÚTIL

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Hosting](https://supabase.com/docs/guides/hosting)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**Deploy concluído! 🚀 Seu app está no ar!**

