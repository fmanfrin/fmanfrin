# 🧪 GUIA COMPLETO DE TESTES - VALIDAÇÃO LOCAL

**Objetivo:** Verificar que TODAS as funcionalidades funcionam antes de deploy
**Tempo Estimado:** 30-45 minutos
**Dificuldade:** ⭐ Fácil

---

## 🚀 PASSO 1: Setup Inicial

### 1.1 Verificar que Tudo Está Instalado
```bash
# Na pasta C:\Users\manfr\claude\training-app

# 1. Verificar Node.js
node --version
# Esperado: v18.0.0 ou maior

# 2. Verificar npm
npm --version
# Esperado: v9.0.0 ou maior

# 3. Instalar dependências (se não tiver feito)
npm install
# Esperado: sem erros
```

### 1.2 Verificar Variáveis de Ambiente
```bash
# Verificar que .env.local existe
cat .env.local

# Esperado: contém estas variáveis:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# Se não existir, copiar do exemplo:
cp .env.example .env.local
# Adicionar suas credenciais Supabase
```

### 1.3 Verificar Build
```bash
npm run build
# Esperado: "✓ Ready in 30s" ou similar
# ❌ Se falhar, ler erro e corrigir
```

---

## 🌱 PASSO 2: Seed com Dados Demo

### 2.1 Executar Seed
```bash
npm run seed:demo
# Esperado: output como este:

═══════════════════════════════════════════
✅ SEED DEMO CONCLUÍDO COM SUCESSO!
═══════════════════════════════════════════

📊 Resumo do que foi criado:
  • Organização: Solare Alimentos
  • Departamentos: 5
  • Colaboradores: 9
  • Conteúdos: 3
  • Treinamentos: 3
  • Níveis: 6
```

### 2.2 Verificar no Supabase
```
1. Ir para https://app.supabase.com
2. Selecionar seu projeto
3. Ir para "SQL Editor"
4. Executar:
   SELECT COUNT(*) FROM organizations;
   → Esperado: 1 (Solare Alimentos)
   
5. Executar:
   SELECT COUNT(*) FROM employees;
   → Esperado: 9 colaboradores
   
6. Executar:
   SELECT COUNT(*) FROM trainings;
   → Esperado: 3 treinamentos
```

---

## 🚀 PASSO 3: Iniciar Dev Server

### 3.1 Rodar Servidor
```bash
npm run dev

# Esperado:
# ▲ Next.js 15.3.0
# - Local:        http://localhost:3000
# - Environments: .env.local
# 
# ✓ Ready in 2.5s
```

### 3.2 Acessar Aplicação
```
Abrir navegador: http://localhost:3000
Esperado: Página de login carrega
```

---

## ✅ PASSO 4: Testes Funcionais

### 4.1 Teste de Login (Admin)

```
1. Ir para http://localhost:3000/login
2. Email: ana@solare.com
3. Password: (clique "Forgot password" para resetar)
   
Esperado:
✓ Página de login carrega
✓ Email aceita input
✓ Pode clicar em "Forgot password"
✓ Email de reset é enviado (verificar em Supabase)
```

### 4.2 Teste de Signup (Novo Usuário)

```
1. Ir para http://localhost:3000/signup
2. Preencher:
   - Email: test@example.com
   - Password: TestPassword123!
   - Organization: Test Org
   
Esperado:
✓ Validação de email funciona
✓ Validação de password funciona
✓ Pode criar nova organização
✓ Após signup, redireciona para dashboard
```

### 4.3 Teste de Dashboard Admin

```
1. Fazer login como ana@solare.com
2. Ir para /admin/dashboard

Esperado:
✓ Dashboard carrega
✓ Mostra KPIs (colaboradores, treinamentos, etc)
✓ Gráficos aparecem
✓ Números estão corretos

Verificar:
□ "Colaboradores Ativos": deve mostrar 9
□ "Treinamentos Publicados": deve mostrar 3
□ "Taxa de Conclusão": deve mostrar 0% (ainda não fez treino)
□ Gráficos: deve conter dados
```

### 4.4 Teste de Dashboard Colaborador

```
1. Fazer login como carlos@solare.com
2. Ir para /dashboard (página inicial)

Esperado:
✓ Dashboard pessoal carrega
✓ Mostra "Bem-vindo, Carlos!"
✓ Pontos: 0 (inicialmente)
✓ Treinamentos completos: 0
✓ Nível: Iniciante
✓ Metas do mês aparecem

Verificar números fazem sentido
```

---

## 📚 PASSO 5: Testes de Conteúdo

### 5.1 Teste de Knowledge Base

```
1. Como admin (ana@solare.com)
2. Ir para /admin/knowledge-base

Esperado:
✓ Página carrega
✓ Lista 3 conteúdos:
  □ "Conheça a Solare"
  □ "Fundamentos de Vendas"
  □ "Produtos Solare"
✓ Pode clicar em cada um
✓ Vê o conteúdo completo
```

### 5.2 Teste de Upload de Conteúdo

```
1. Na mesma página, click "Upload" tab
2. Selecionar arquivo (TXT, MD, PDF)
3. Preencher:
   - Título: "Test Content"
   - Categoria: "training"
4. Click "Upload"

Esperado:
✓ Upload bem-sucedido
✓ Novo conteúdo aparece na lista
✓ Pode ver detalhes do arquivo
```

---

## 🎓 PASSO 6: Testes de Treinamentos

### 6.1 Teste de Visualização

```
1. Como admin, ir para /admin/trainings

Esperado:
✓ Lista 3 treinamentos publicados
✓ Mostra título, dificuldade, pontos
✓ Status: "Published"
✓ Pode clicar para ver detalhes
```

### 6.2 Teste de Realização de Treinamento

```
1. Como colaborador (carlos@solare.com)
2. Ir para /trainings
3. Selecionar qualquer treinamento
4. Click "Iniciar Treinamento"

Esperado:
✓ Página de quiz carrega
✓ Mostra pergunta com opções
✓ Barra de progresso aparece
✓ Timer funciona (se configurado)
✓ Pode navegar (anterior/próximo)
```

### 6.3 Teste de Resposta de Perguntas

```
1. Na página de quiz:
2. Responder todas as perguntas
3. Verificar tipos diferentes:
   □ Múltipla escolha: selecionar opção
   □ Verdadeiro/Falso: clicar botão
   □ Resposta curta: digitar texto
   □ Dissertativa: digitar parágrafo

Esperado:
✓ Todas as respostas salvam
✓ Pode voltar e ver resposta anterior
✓ Todos os tipos funcionam
```

### 6.4 Teste de Resultado

```
1. Após responder todas:
2. Click "Enviar"
3. Aguardar processamento
4. Ver página de resultado

Esperado:
✓ Score é calculado e exibido
✓ Percentual aparece
✓ Status (Aprovado/Reprovado)
✓ Pontos conquistados mostram
✓ Pode fazer download do certificado
✓ Pode tentar novamente (se permitido)
```

---

## 🏆 PASSO 7: Testes de Gamificação

### 7.1 Teste de Pontos

```
1. Após completar treinamento:
2. Voltar ao dashboard (/dashboard)
3. Verificar:

Esperado:
✓ Pontos aumentaram
✓ Mostra pontos totais
✓ Barra de progresso atualiza
✓ Próximo nível mostra corretamente
```

### 7.2 Teste de Rankings

```
1. Ir para /app/rankings

Esperado:
✓ Página carrega
✓ Mostra top 3 com medalhas:
  □ 🥇 1º lugar
  □ 🥈 2º lugar
  □ 🥉 3º lugar
✓ Tabela completa listando todos
✓ Sua posição está destacada
✓ Filtros funcionam (geral/departamento)
```

### 7.3 Teste de Badges

```
1. Após obter badges:
2. Ir para /dashboard
3. Verificar seção de badges

Esperado:
✓ Badges conquistadas aparecem
✓ Mostram icon, nome, descrição
✓ Data de conquista
✓ Número total de badges
```

---

## 🎯 PASSO 8: Testes de Competições

### 8.1 Teste de Visualização

```
1. Como admin (ana@solare.com)
2. Ir para /admin/competitions

Esperado:
✓ Lista de competições carrega
✓ Botão "Nova Competição" existe
✓ Pode clicar para criar (teste opcionalmente)
```

### 8.2 Teste de Participação

```
1. Como colaborador (carlos@solare.com)
2. Ir para /app/competitions

Esperado:
✓ Lista de competições carrega
✓ Mostra descrição, período, critério
✓ Pode clicar em detalhes
✓ Pode clicar "Participar"
✓ Ranking da competição atualiza
```

---

## 📊 PASSO 9: Testes de Relatórios

### 9.1 Teste de Geração

```
1. Como admin, ir para /admin/reports

Esperado:
✓ Página carrega
✓ Lista 6 tipos de relatório
✓ Pode selecionar cada um
✓ Mostra descrição do relatório
```

### 9.2 Teste de Exportação

```
1. Selecionar "Desempenho de Colaboradores"
2. Click "Baixar Relatório"
3. Arquivo é baixado como CSV

Esperado:
✓ Download começa
✓ Nome: "relatorio_employee_performance_2024-06-21.csv"
✓ Pode abrir em Excel/Sheets
✓ Contém dados dos colaboradores
✓ Colunas: nome, área, pontos, treinamentos, média
```

---

## 🔒 PASSO 10: Testes de Segurança

### 10.1 Teste de Isolamento Multi-Tenant

```
1. Como ana@solare.com (Solare Alimentos)
2. Ir para /admin/employees
3. Ver lista de colaboradores (deve ser 9)
4. Logout

5. Criar novo usuário:
   Email: novo@test.com
   Organization: "Outra Empresa"
6. Login como novo@test.com
7. Ir para /admin/employees

Esperado:
✓ Vê APENAS os colaboradores da "Outra Empresa"
✓ NÃO vê os 9 da Solare (isolamento RLS)
✓ Não pode acessar dados de outra org
```

### 10.2 Teste de Validação de Input

```
1. Como admin, ir para /admin/employees
2. Tentar criar novo colaborador com:
   - Nome: <script>alert('xss')</script>
   - Email: invalid (sem @)
   - CPF: 000.000.000-00 (inválido)

Esperado:
✓ Validação rejeita input malformado
✓ Mensagens de erro aparecem
✓ Não cria com dados inválidos
```

### 10.3 Teste de Rate Limiting

```
1. Como colaborador (carlos@solare.com)
2. Ir para /api/dashboard/employee
3. Fazer 10+ requisições rapidamente
   (abrir console e fazer fetch múltiplas vezes)

Esperado:
✓ Primeiras requisições retornam 200
✓ Após limite, recebe erro 429 (Too Many Requests)
✓ Rate limiter funciona
```

---

## 🐛 PASSO 11: Testes de Bugs Comuns

### 11.1 Console Errors
```
1. Abrir DevTools (F12)
2. Aba "Console"
3. Navegar por todas as páginas

Esperado:
✓ Nenhum erro vermelho
✓ Apenas warnings (se houver)
✓ Network requests são 200/201/204
❌ Se houver erro 500, algo está quebrado
```

### 11.2 Performance
```
1. Abrir DevTools
2. Aba "Network"
3. Recarregar página (/dashboard)

Esperado:
✓ Load time < 3 segundos
✓ Largest Contentful Paint < 2s
✓ No warnings amarelos
✓ Imagens carregam rapidamente
```

### 11.3 Responsividade
```
1. DevTools → Ctrl+Shift+M (Mobile)
2. Testar em tamanho mobile (375px)
3. Navegar por páginas principais

Esperado:
✓ Layout se adapta
✓ Texto é legível
✓ Botões são clicáveis
✓ Sem horizontal scroll
```

---

## 📋 CHECKLIST FINAL

### Core Functionality
- [ ] Login funciona (admin)
- [ ] Signup funciona (novo usuário)
- [ ] Dashboard admin carrega
- [ ] Dashboard colaborador carrega
- [ ] Ver conteúdo funciona
- [ ] Upload de arquivo funciona
- [ ] Realizar treinamento funciona
- [ ] Enviar respostas funciona
- [ ] Ver resultado funciona
- [ ] Pontos são atribuídos
- [ ] Ranking atualiza
- [ ] Badges são awarded
- [ ] Relatório é gerado
- [ ] Exportação CSV funciona

### Security
- [ ] Isolamento multi-tenant funciona
- [ ] Validação de input funciona
- [ ] Rate limiting funciona
- [ ] Sem XSS vulnerabilities
- [ ] CPF é hasheado corretamente

### Performance
- [ ] Build completou sem erros
- [ ] Dev server inicia rapidamente
- [ ] Páginas carregam < 3s
- [ ] Sem memory leaks
- [ ] Responsive em mobile

### Data Integrity
- [ ] Seed criou 9 colaboradores
- [ ] 3 treinamentos foram criados
- [ ] 3 conteúdos estão visíveis
- [ ] Pontos são calculados corretamente
- [ ] Rankings refletem pontos corretamente

---

## 🆘 TROUBLESHOOTING

### "Página em branco"
```
1. Abrir Console (F12)
2. Ver erro específico
3. Comum: Variável de ambiente faltando
   → Adicionar em .env.local e reiniciar
```

### "Erro de conexão ao Supabase"
```
1. Verificar .env.local tem as 3 variáveis
2. Copiar credenciais exatas do Supabase
3. Reiniciar servidor: Ctrl+C e npm run dev
```

### "Migrations não rodaram"
```
1. Ir para Supabase → SQL Editor
2. Executar cada migration manualmente:
   - 001_initial_schema.sql
   - 002_trainings_schema.sql
   - 003_competitions_schema.sql
   - 004_audit_and_logs.sql
   - rls-policies.sql
3. Verificar que não há erros
```

### "Seed falha"
```
1. Verificar que migrations rodaram
2. Verificar CPFs são válidos
3. Rodar novamente:
   npm run seed:demo
```

---

## ✅ TESTE CONCLUÍDO COM SUCESSO!

Se TODAS as caixas acima estão marcadas ✅, então:

```
🟢 Aplicação está 100% funcionando
🟢 Pronta para deploy em Vercel
🟢 Segura para usuários reais
🟢 Performance está ótima
```

---

## 🚀 PRÓXIMO PASSO

Quando todos os testes passam:

```bash
# 1. Commit das mudanças (se houver)
git add .
git commit -m "test: validate all features before production"

# 2. Push para GitHub
git push origin main

# 3. Deploy em Vercel
# Seguir: DEPLOYMENT_GUIDE.md
```

---

**Testes concluídos! Pronto para conquistar o mundo! 🌍**

