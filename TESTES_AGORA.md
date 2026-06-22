# 🧪 COMEÇAR TESTES AGORA - PASSO A PASSO

**Objetivo:** Validar que 100% funciona antes de produção
**Tempo:** ~45 minutos
**Status:** Pronto para começar

---

## ⏱️ CRONOGRAMA

```
5 min   → Setup local
2 min   → Seed demo
1 min   → Dev server
5 min   → Teste rápido
10 min  → Testes completos
10 min  → Verificações finais
2 min   → Resumo
─────────────────
35 min total (relaxado, sem pressa)
```

---

## 🚀 COMEÇAR: PASSO 1 (5 min)

### 1.1 Abrir Terminal/PowerShell

```
Pasta: C:\Users\manfr\claude\training-app
```

### 1.2 Verificar versões

```powershell
node --version
# Esperado: v18.0.0 ou maior

npm --version
# Esperado: v9.0.0 ou maior
```

### 1.3 Fazer build

```powershell
npm run build
```

**Esperado:**
```
✓ Ready in XXs
```

**Se falhar:**
- Ler erro na tela
- Parar aqui e me avisar qual erro

---

## 🌱 PASSO 2: SEED DEMO (2 min)

```powershell
npm run seed:demo
```

**Esperado:**
```
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

**Se falhar:**
- Erro comum: migrations não rodaram
- Solução: Me avisar qual erro

---

## 🚀 PASSO 3: DEV SERVER (1 min)

```powershell
npm run dev
```

**Esperado:**
```
▲ Next.js 15.3.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

**Deixe rodando!** Você precisará dessa janela aberta para todos os testes.

---

## ✅ PASSO 4: TESTE RÁPIDO (5 min)

Abra navegador: **http://localhost:3000/login**

### 4.1 Verificar página carrega
- ✅ Página de login aparece
- ✅ Input de email
- ✅ Input de password
- ✅ Botão "Sign In"
- ✅ Link "Forgot password"

### 4.2 Fazer login

```
Email: ana@solare.com
Password: (clique "Forgot password")
```

Siga o flow:
1. Digite email
2. Click "Forgot password"
3. Você receberá um email (check Supabase)
4. Resete a password
5. Faça login com nova password

### 4.3 Verificar dashboard
- ✅ Página carrega após login
- ✅ Mostra seu nome (Ana Silva)
- ✅ Mostra seu nível (Iniciante)
- ✅ Mostra dados da empresa

**Se tudo OK → ✅ Passe ao Passo 5**

---

## 🎯 PASSO 5: TESTES COMPLETOS (10 min)

### 5.1 Admin Dashboard
```
URL: http://localhost:3000/admin/dashboard
```

Verificar:
- [ ] Dashboard carrega
- [ ] Mostra 9 colaboradores
- [ ] Mostra 3 treinamentos
- [ ] Gráficos aparecem
- [ ] Números fazem sentido

### 5.2 Knowledge Base
```
URL: http://localhost:3000/admin/knowledge-base
```

Verificar:
- [ ] Lista 3 conteúdos
  - "Conheça a Solare"
  - "Fundamentos de Vendas"
  - "Produtos Solare"
- [ ] Pode clicar em cada um
- [ ] Vê o conteúdo completo

### 5.3 Treinamentos
```
URL: http://localhost:3000/admin/trainings
```

Verificar:
- [ ] Lista 3 treinamentos publicados
- [ ] Mostra título, dificuldade, pontos
- [ ] Status: "Published"

### 5.4 Realizar Treinamento (Como Colaborador)
```
1. Logout (admin) → clique seu nome → Logout
2. Login como: carlos@solare.com (reset password)
3. URL: http://localhost:3000/trainings
```

Verificar:
- [ ] Vê lista de treinamentos
- [ ] Clica em um treinamento
- [ ] Clica "Iniciar Treinamento"
- [ ] Página de quiz carrega
- [ ] Vê pergunta com opções
- [ ] Responde a pergunta
- [ ] Clica "Próximo"

### 5.5 Resultado de Treinamento
```
Após responder todas as perguntas:
1. Clica "Enviar"
2. Aguarda processamento
3. Vê página de resultado
```

Verificar:
- [ ] Score é exibido
- [ ] Percentual aparece
- [ ] Status (Aprovado/Reprovado)
- [ ] Pontos conquistados mostram
- [ ] Pode fazer download de certificado

### 5.6 Rankings
```
URL: http://localhost:3000/app/rankings
```

Verificar:
- [ ] Página carrega
- [ ] Mostra top 3 com medalhas (🥇🥈🥉)
- [ ] Tabela completa
- [ ] Sua posição está lá

### 5.7 Relatórios (Como Admin)
```
1. Login como: ana@solare.com
2. URL: http://localhost:3000/admin/reports
```

Verificar:
- [ ] Página carrega
- [ ] Lista 6 tipos de relatório
- [ ] Pode selecionar um
- [ ] Clica "Baixar Relatório"
- [ ] CSV é baixado
- [ ] Pode abrir em Excel/Sheets

---

## 🔒 PASSO 6: SEGURANÇA (5 min)

### 6.1 Isolamento Multi-Tenant
```
1. Como ana@solare.com, vá para: /admin/employees
2. Ver lista (deve mostrar 9 colaboradores)
3. Logout
4. Criar novo usuário:
   - Email: novo@teste.com
   - Organization: "Outra Empresa"
5. Login como novo@teste.com
6. Vá para: /admin/employees
```

Verificar:
- ✅ APENAS vê colaboradores da "Outra Empresa"
- ✅ NÃO vê os 9 da Solare
- ✅ Isolamento funciona perfeito!

### 6.2 Validação de Input
```
Como admin, tente criar colaborador com:
- Nome: <script>alert('xss')</script>
- Email: sem-arroba (inválido)
- CPF: 000.000.000-00 (inválido)
```

Verificar:
- ✅ Validação rejeita
- ✅ Mensagens de erro aparecem
- ✅ Não cria com dados inválidos

### 6.3 Console (Sem Erros)
```
1. Abrir DevTools (F12)
2. Aba "Console"
3. Navegar por várias páginas
```

Verificar:
- ✅ Nenhum erro em vermelho
- ✅ Apenas warnings (se houver)
- ✅ Network requests são 200/201/204

---

## 📋 CHECKLIST FINAL

```
TESTE                                    RESULTADO
═══════════════════════════════════════════════════════════
Build compilou sem erro                  [ ] ✅ [ ] ❌
Seed demo criou dados                    [ ] ✅ [ ] ❌
Dev server iniciou                       [ ] ✅ [ ] ❌
Login funciona                           [ ] ✅ [ ] ❌
Dashboard admin carrega                  [ ] ✅ [ ] ❌
Knowledge base mostra 3 conteúdos        [ ] ✅ [ ] ❌
Trainings lista 3 publicados             [ ] ✅ [ ] ❌
Pode realizar treinamento                [ ] ✅ [ ] ❌
Resultado é exibido corretamente         [ ] ✅ [ ] ❌
Ranking atualiza                         [ ] ✅ [ ] ❌
Relatório é gerado e exporta CSV         [ ] ✅ [ ] ❌
Isolamento multi-tenant funciona         [ ] ✅ [ ] ❌
Validação rejeita inputs inválidos       [ ] ✅ [ ] ❌
Console sem erros vermelhos              [ ] ✅ [ ] ❌
Performance é boa (< 3s por página)      [ ] ✅ [ ] ❌
═══════════════════════════════════════════════════════════
TOTAL: __ / 15 testes
```

---

## 🎯 RESULTADO

### Se 14-15 testes passam ✅
```
🟢 APLICAÇÃO ESTÁ 100% FUNCIONAL
🟢 PRONTA PARA DEPLOY
🟢 QUALIDADE DE PRODUÇÃO
```

### Se 12-13 testes passam ⚠️
```
🟡 Funcional, mas com pequenos problemas
🟡 Revisar e corrigir antes de deploy
```

### Se menos de 12 ❌
```
🔴 Parar e avisar qual teste falhou
🔴 Não fazer deploy até tudo passar
```

---

## 🆘 PROBLEMAS COMUNS

### "Página em branco"
```
1. F12 → Console
2. Ver qual erro aparece
3. Me avisar o erro específico
```

### "Erro de conexão ao Supabase"
```
Solução: .env.local tem as 3 variáveis Supabase?
├─ NEXT_PUBLIC_SUPABASE_URL
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
└─ SUPABASE_SERVICE_ROLE_KEY

Se sim: reiniciar servidor (Ctrl+C, npm run dev)
Se não: adicionar as variáveis
```

### "Seed falha"
```
1. Migrations rodaram em Supabase?
2. RLS policies foram aplicadas?
3. Tentar seed novamente: npm run seed:demo
```

### "Login não funciona"
```
1. Email existe em Supabase auth?
2. Clique "Forgot password" para resetar
3. Use novo password para fazer login
```

---

## ✅ PRÓXIMO PASSO APÓS TESTES

Quando todos os 15 testes ✅ passam:

```bash
# 1. Parar dev server (Ctrl+C)
# 2. Fazer commit
git add .
git commit -m "test: all features validated before production"

# 3. Push para GitHub
git push origin main

# 4. Fazer deploy em Vercel
# Seguir DEPLOYMENT_GUIDE.md
```

---

## 📞 SE PRECISAR DE AJUDA

Durante os testes:
1. Me avise qual passo falhou
2. Copie a mensagem de erro exata
3. Descrição do que você viu na tela

Estou aqui para ajudar! ✅

---

**Começar agora: Execute o PASSO 1!**

