#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║      ELEVARE TREINAMENTOS - AUTO DEPLOY SCRIPT        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: GitHub Setup
echo -e "${YELLOW}[1/3] Configurando GitHub...${NC}"
echo ""
echo "Você vai precisar de:"
echo "  1. Username GitHub"
echo "  2. Email GitHub"
echo ""
read -p "Digite seu username GitHub: " GITHUB_USER
read -p "Digite seu email GitHub: " GITHUB_EMAIL

git config --global user.name "$GITHUB_USER"
git config --global user.email "$GITHUB_EMAIL"

echo -e "${GREEN}✅ GitHub configurado${NC}"
echo ""

# Step 2: Create & Push
echo -e "${YELLOW}[2/3] Fazendo push para GitHub...${NC}"
echo ""
echo "Você vai criar um repo em: https://github.com/new"
echo "Depois copiar a URL e colar aqui"
echo ""
read -p "Cole a URL do repositório (ex: https://github.com/usuario/training-app.git): " REPO_URL

git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Push concluído com sucesso!${NC}"
else
  echo -e "${RED}❌ Erro ao fazer push${NC}"
  echo "Verifique se a URL está correta"
  exit 1
fi

echo ""

# Step 3: Vercel
echo -e "${YELLOW}[3/3] Preparando para Vercel...${NC}"
echo ""
echo "Agora você precisa:"
echo "  1. Ir para: https://vercel.com/new"
echo "  2. Conectar GitHub"
echo "  3. Selecionar: training-app"
echo "  4. Adicionar Environment Variables:"
echo "     - NEXT_PUBLIC_SUPABASE_URL"
echo "     - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "     - SUPABASE_SERVICE_ROLE_KEY"
echo "  5. Click: Deploy"
echo ""
echo "Obtém as credenciais em:"
echo "  https://app.supabase.com → seu-projeto → Settings → API"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Código está em: $REPO_URL${NC}"
echo -e "${GREEN}✅ Agora faça deploy em: https://vercel.com/new${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "App estará rodando em: https://seu-projeto.vercel.app"
echo ""

