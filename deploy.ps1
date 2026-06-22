# ============================================
# ELEVARE TREINAMENTOS - AUTO DEPLOY SCRIPT
# ============================================

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      ELEVARE TREINAMENTOS - AUTO DEPLOY SCRIPT        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Step 1: GitHub Configuration
Write-Host "[1/3] Configurando GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Digite suas credenciais GitHub:"
$githubUser = Read-Host "Username"
$githubEmail = Read-Host "Email"

git config --global user.name $githubUser
git config --global user.email $githubEmail

Write-Host "✅ GitHub configurado" -ForegroundColor Green
Write-Host ""

# Step 2: Create Repository
Write-Host "[2/3] Fazendo push para GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Você precisa:"
Write-Host "  1. Ir para: https://github.com/new"
Write-Host "  2. Criar repositório: training-app"
Write-Host "  3. Copiar a URL"
Write-Host ""

$repoUrl = Read-Host "Cole a URL do repositório (https://github.com/usuario/training-app.git)"

cd "C:\Users\manfr\claude\training-app"

# Add remote
git remote add origin $repoUrl 2>$null
if ($LASTEXITCODE -ne 0) {
  git remote set-url origin $repoUrl
}

# Push
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Push concluído com sucesso!" -ForegroundColor Green
} else {
  Write-Host "❌ Erro ao fazer push" -ForegroundColor Red
  exit 1
}

Write-Host ""

# Step 3: Vercel
Write-Host "[3/3] Preparando para Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora você precisa:" -ForegroundColor Yellow
Write-Host "  1. Ir para: https://vercel.com/new" -ForegroundColor Yellow
Write-Host "  2. Conectar GitHub" -ForegroundColor Yellow
Write-Host "  3. Selecionar: training-app" -ForegroundColor Yellow
Write-Host "  4. Adicionar Environment Variables:" -ForegroundColor Yellow
Write-Host "     - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Yellow
Write-Host "     - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow
Write-Host "     - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
Write-Host "  5. Click: Deploy" -ForegroundColor Yellow
Write-Host ""
Write-Host "Obtém as credenciais em:" -ForegroundColor Cyan
Write-Host "  https://app.supabase.com → seu-projeto → Settings → API" -ForegroundColor Cyan
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Código está em: $repoUrl" -ForegroundColor Green
Write-Host "✅ Agora faça deploy em: https://vercel.com/new" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "App estará rodando em: https://seu-projeto.vercel.app" -ForegroundColor Green
Write-Host ""

Read-Host "Pressione Enter para sair"
