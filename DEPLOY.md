# 🚀 DEPLOY AUTOMÁTICO - PASSO A PASSO

## ⚡ SUPER RÁPIDO (5 minutos)

### **PASSO 1: Criar Repositório no GitHub**

```
1. Ir para: https://github.com/new
2. Nome do repo: training-app
3. Descrição: Elevare Treinamentos - SaaS Platform
4. Escolher: Private
5. Clicar: Create repository
6. COPIAR a URL que aparece: https://github.com/SEU-USUARIO/training-app.git
```

---

### **PASSO 2: Fazer Push Local (COPIE E COLE)**

Abra PowerShell na pasta do projeto e execute:

```powershell
cd C:\Users\manfr\claude\training-app

# Configure seu GitHub (uma vez)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@gmail.com"

# Adicione o remote (substitua SEU-USUARIO/training-app)
git remote add origin https://github.com/SEU-USUARIO/training-app.git

# Mude branch para main
git branch -M main

# Faça push
git push -u origin main
```

---

### **PASSO 3: Conectar em Vercel (2 minutos)**

```
1. Ir para: https://vercel.com/new
2. Conectar GitHub com a conta Vercel
3. Selecionar projeto: training-app
4. Clicar: Import
5. Em "Environment Variables", adicionar:
   - NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   - SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
6. Clicar: Deploy
7. Aguardar ~3-5 minutos
8. ✅ App em produção!
```

---

## 📋 **OBTER CREDENCIAIS SUPABASE**

Se você já tem projeto Supabase:

```
1. Ir para: https://app.supabase.com
2. Selecionar seu projeto
3. Settings → API
4. Copiar:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role secret → SUPABASE_SERVICE_ROLE_KEY
```

---

## ✅ **CHECKLIST**

- [ ] Repositório criado no GitHub
- [ ] Git push concluído
- [ ] Vercel importou projeto
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy concluído
- [ ] App rodando em vercel.app

---

## 🎉 **PRONTO!**

Seu app estará rodando em:
```
https://seu-projeto.vercel.app
```

Teste:
1. Ir para https://seu-projeto.vercel.app/login
2. Email: ana@solare.com
3. Clique em "Forgot Password"
4. Reset a senha
5. Faça login

---

## 🆘 **PROBLEMAS?**

Se der erro em variáveis de ambiente:
1. Vercel → seu-app → Settings → Environment Variables
2. Adicionar/corrigir as variáveis
3. Click "Redeploy"

Se der erro de CORS:
1. Supabase → Settings → API → CORS
2. Adicionar: https://seu-projeto.vercel.app
3. Aguardar 1 minuto
4. Recarregar página

---

**Pronto! Seu app está em produção! 🚀**
