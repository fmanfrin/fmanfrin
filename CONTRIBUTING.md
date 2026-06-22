# 📖 Contributing to Elevare Treinamentos

Obrigado por considerar contribuir para o Elevare Treinamentos! Este documento fornece diretrizes e instruções.

## 🎯 Código de Conduta

Seja respeitoso, inclusivo e profissional.

## 🐛 Reportando Bugs

1. **Verifique issues existentes** - Evite duplicatas
2. **Descreva o problema** - Contexto, passos para reproduzir
3. **Ambiente** - Node version, SO, navegador
4. **Exemplo** - Código ou screenshot ajuda

## 💡 Sugestões de Features

1. **Use issue com tag `enhancement`**
2. **Descreva a motivação**
3. **Exemplo de uso**
4. **Possíveis alternativas**

## 🔧 Setup de Desenvolvimento

```bash
# Clone
git clone <repo>
cd training-app

# Dependencies
npm install

# Env
cp .env.example .env.local
# Configure Supabase e OpenAI

# Database migrations
# Execute em Supabase SQL Editor:
# - db/migrations/001_initial_schema.sql
# - db/migrations/002_trainings_schema.sql
# - db/migrations/003_competitions_schema.sql
# - db/migrations/004_audit_and_logs.sql
# - db/rls-policies.sql

# Dev server
npm run dev
```

## 📝 Commit Messages

```
feat: add new feature
fix: fix bug
docs: update documentation
refactor: code refactoring
test: add/update tests
chore: maintenance tasks
```

Exemplo:
```
feat: add email notifications for training completion

- Send email when training is submitted
- Include score and next steps in email
- Add email template
```

## 🎨 Code Style

### TypeScript
- Use **strict mode** (tsconfig.json)
- Type all function parameters and returns
- Avoid `any` type

### React
- Functional components
- React Hook Form para formulários
- Tailwind CSS para styling
- Componentes reutilizáveis

### Database
- Use parametrized queries (sempre!)
- Validar entrada com Zod
- Adicionar RLS policies para segurança

### API Routes
```typescript
// ✅ BOM
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Lógica
  return NextResponse.json({ data })
}

// ❌ RUIM
export async function GET(request: NextRequest) {
  // Sem checagem de auth
  return NextResponse.json(...)
}
```

## 🧪 Testes

```bash
# Testes unitários (quando implementados)
npm run test

# Teste E2E (quando implementados)
npm run test:e2e

# Verificar build
npm run build
```

## 📤 Pull Request

1. **Crie branch** - `git checkout -b feature/amazing`
2. **Commit changes** - `git commit -m 'feat: add amazing feature'`
3. **Push** - `git push origin feature/amazing`
4. **Abra PR** no GitHub

### PR Description Template

```markdown
## 📝 Descrição
Breve descrição do que muda.

## 🎯 Tipo de Mudança
- [ ] Bug fix
- [ ] Feature nova
- [ ] Breaking change
- [ ] Doc update

## ✅ Checklist
- [ ] Código segue style guide
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] Migrations criadas (se BD)
- [ ] RLS policies (se aplicável)

## 🧪 Como testar
Instruções para testar a mudança.

## 📸 Screenshots (se aplicável)
```

## 🔐 Segurança

- **Nunca** commite .env.local
- **Sempre** validate input com Zod
- **Sempre** use parametrized queries
- **Sempre** verifique autenticação em APIs
- **Sempre** adicione RLS policies
- **Nunca** exporte dados sensíveis

## 📊 Estrutura de Fases

O projeto foi desenvolvido em 13 fases:

```
1. Fundação SaaS
2. Colaboradores
3. Base de Conhecimento
4. Geração com IA
5. Realização de Treinamentos
6. Gamificação
7. Rankings
8. Competições
9. Dashboards
10. Relatórios
11. Segurança Avançada
12. Seed Demo
13. Deploy & Docs
```

Respeite esta estrutura ao contribuir.

## 🚀 Performance

- Minimize bundle size
- Optimize database queries
- Use Next.js Image component
- Prefira CSS modules ou Tailwind
- Evite prop drilling (use context)

## 📚 Documentação

- Update README se mudar arquitetura
- Add JSDoc comments para funções complexas
- Update .env.example se adicionar vars
- Add migrations SQL com comentários

## ❓ Dúvidas?

- 📧 Email: dev@elevare.com
- 💬 Discord: [link]
- 📖 Wiki: [link]

---

Obrigado por contribuir! 🎉
