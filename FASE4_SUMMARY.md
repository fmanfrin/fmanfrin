# Fase 4: Geração de Treinamentos com IA - RESUMO

**Status:** Implementação completa ✅
**Data:** Junho 2024
**Próximo passo:** Fase 5 (Realização de Treinamentos)

## O Que Foi Criado

### 1. **Serviço OpenAI** ✅
- `lib/ai/training-generator.ts`
- Integração completa com OpenAI API
- Geração de treinamentos estruturados
- Prompts otimizados com regras de negócio
- Schema Zod para validação de respostas
- Fallback com mock data (sem API key)
- Estimativa de custo de API
- Log de uso de IA

**Features:**
- ✅ Apenas conteúdo fornecido é usado
- ✅ Detecção de informações insuficientes
- ✅ Diversidade de tipos de perguntas
- ✅ Resposta JSON estruturada
- ✅ Explicações pedagógicas

### 2. **Validações com Zod** ✅
- `lib/validations/training.ts`
- `generateTrainingWithAISchema` - Requisição de geração
- `createTrainingManuallySchema` - Criação manual
- `createTrainingQuestionSchema` - Pergunta individual
- `publishTrainingSchema` - Publicação

### 3. **Database Functions** ✅
Adicionadas em `lib/db.ts`:
- `createTraining()` - Criar treinamento
- `listTrainings()` - Listar com filtros
- `getTraining()` - Detalhe
- `getTrainingWithQuestions()` - Com perguntas
- `updateTraining()` - Atualizar
- `publishTraining()` - Publicar
- `createTrainingQuestion()` - Criar pergunta
- `bulkCreateTrainingQuestions()` - Inserir múltiplas

**Features:**
- ✅ Versionamento automático
- ✅ Paginação
- ✅ Filtros por status, área, dificuldade
- ✅ Busca por título/descrição
- ✅ Rastreamento de autor

### 4. **API Endpoint** ✅
- `app/api/trainings/generate-with-ai/route.ts`

**Fluxo:**
1. Recebe requisição com parâmetros
2. Busca conteúdos selecionados
3. Extrai textos
4. Envia para OpenAI
5. Cria training no banco
6. Insere perguntas
7. Retorna training + metadata

**Tratamento de erros:**
- Validação com Zod
- Verificação de conteúdo vazio
- Erros da API OpenAI claros
- Resposta inválida detectada
- Fallback para mock data

### 5. **Interface de Usuário** ✅
- `app/admin/trainings/create-with-ai/page.tsx`

**4 Passos:**
1. **Configuração** - Formulário completo
2. **Gerando** - Indicador de progresso
3. **Revisão** - Preview de treinamento gerado
4. **Sucesso** - Confirmação e próximas ações

**Campos da Configuração:**
- Título, Público-alvo, Objetivo (required)
- Nível de dificuldade
- Quantidade de perguntas (3-50)
- Nota mínima (0-100%)
- Pontos máximos
- Tipos de perguntas (checkboxes)
- Seleção de conteúdos

## Arquitetura da Geração com IA

```
Frontend (UI)
    ↓
   Form (configuração)
    ↓
API: POST /api/trainings/generate-with-ai
    ↓
Backend:
  1. Validar entrada (Zod)
  2. Buscar conteúdos no DB
  3. Extrair textos
  4. Chamar OpenAI API
    ↓
    System Prompt (regras)
    ↓
    User Prompt (requisição)
    ↓
    Response (JSON)
  5. Validar resposta (Zod)
  6. Criar Training record
  7. Inserir Questions (bulk)
  8. Retornar com metadata
    ↓
Frontend:
  1. Receber training gerado
  2. Mostrar preview
  3. Permitir edição (próximas fases)
  4. Publicar
```

## Prompt do OpenAI

### System Prompt
```
Você é especialista em design instrucional.
Regras:
- APENAS conteúdo fornecido
- Se informação insuficiente, indicar
- Nunca inventar dados
- Linguagem clara e profissional
- Diversidade de tipos
- Sem dados pessoais
- Sempre referenciar conteúdo
```

### User Prompt
```
Crie treinamento com:
- Título
- Público-alvo
- Nível de dificuldade
- Objetivos
- Número de perguntas
- Tipos desejados

Resposta em JSON estruturado
```

### Response Example
```json
{
  "trainingTitle": "Venda Consultiva",
  "description": "Treinamento para vendedores...",
  "learningObjectives": [
    "Compreender fundamentos",
    "Aplicar em cenários reais"
  ],
  "estimatedDurationMinutes": 45,
  "suggestedMinPassScore": 70,
  "suggestedMaxPoints": 100,
  "questions": [
    {
      "type": "multiple_choice",
      "statement": "Qual é o primeiro passo?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1,
      "explanation": "Porque...",
      "difficulty": "intermediate",
      "points": 10,
      "sourceReference": "Seção 2.1"
    }
  ]
}
```

## Segurança Implementada

- ✅ OPENAI_API_KEY em `.env` (nunca exposto)
- ✅ Service-side only (sem API key no frontend)
- ✅ Validação com Zod (entrada + resposta)
- ✅ Rate limiting planejado
- ✅ Log de uso de IA
- ✅ Sem dados pessoais em prompts
- ✅ Tratamento de erro robusto

## Modo Mock (Testing)

Se não houver `OPENAI_API_KEY`:
- Função `generateMockTraining()` é usada
- Retorna estrutura válida
- Permite testar UI sem API
- Perfeito para desenvolvimento

## Fluxo Completo de Um Usuário

```
1. Admin vai para /admin/trainings/create-with-ai
2. Preenche formulário:
   - Título: "Negociação Comercial"
   - Público: "Vendedores com 6+ meses"
   - Objetivo: "Desenvolver habilidades de negociação"
   - Dificuldade: Intermediário
   - Perguntas: 15
   - Tipos: Multiple Choice, Caso de Uso
   - Conteúdo: "Manual de Negociação v2024"
3. Clica em "Gerar Treinamento com IA"
4. Frontend envia requisição
5. Backend:
   - Busca "Manual de Negociação v2024"
   - Extrai texto (~5000 palavras)
   - Envia para OpenAI
   - IA gera 15 perguntas
   - Salva no banco
6. Frontend mostra preview:
   - Título, descrição, objetivos
   - 3 perguntas (amostra)
   - Estatísticas
7. Admin revisa e clica "Publicar"
8. Treinamento fica disponível para:
   - Assinação a colaboradores
   - Realização
   - Avaliação
```

## Endpoints Criados

```
POST /api/trainings/generate-with-ai
  Body:
    organizationId, title, contentIds, targetAudience, difficulty,
    objectiveDescription, questionCount, questionTypes, minPassScore, maxPoints
  Response:
    { training, questions, generationDetails }
```

## Database Tables Afetadas

```
trainings
├── id, organization_id, title, description
├── difficulty, learning_objectives, content_summary
├── estimated_duration_minutes, min_pass_score, max_attempts
├── max_points, is_mandatory, author_id
├── status (draft, published, archived)
└── version, created_at, updated_at

training_questions
├── id, training_id, type, statement
├── options (JSON), correct_answer, explanation
├── difficulty, points, source_reference, position
└── created_at, updated_at

training_contents (vincula trainings ↔ content_sources)
├── training_id, content_source_id
└── created_at
```

## Como Testar Localmente

### 1. Com Mock Data (sem OpenAI API)
```bash
npm run dev
# Ir para /admin/trainings/create-with-ai
# Preencher formulário
# Gerar treinamento (usa mock)
```

### 2. Com OpenAI API Real
```bash
# Configurar .env.local
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# Executar mesmo fluxo acima
```

### 3. Via cURL
```bash
curl -X POST http://localhost:3000/api/trainings/generate-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "title": "Negociação",
    "contentIds": ["content-1"],
    "targetAudience": "Vendedores",
    "difficulty": "intermediate",
    "objectiveDescription": "Aprender negociação",
    "questionCount": 10,
    "questionTypes": ["multiple_choice", "case_study"],
    "minPassScore": 70,
    "maxPoints": 100
  }'
```

## Custos Estimados (OpenAI)

**Por treinamento gerado:**
- Input: ~2000 tokens (~$0.02)
- Output: ~800 tokens (~$0.02)
- **Total por treinamento: ~$0.04**

Controle via:
- Rate limiting
- Limits de questionCount (max 50)
- Log de ai_usage_logs
- Alertas se ultrapassar quota

## Linhas de Código Adicionadas

- ~250 linhas: OpenAI service
- ~150 linhas: Validations
- ~200 linhas: Database functions
- ~150 linhas: API endpoint
- ~450 linhas: UI página
- **Total Fase 4:** ~1.200 linhas

## Fases Implementadas

| Fase | Status | Features |
|------|--------|----------|
| **1** | ✅ | Fundação, Auth, RLS |
| **2** | ✅ | Colaboradores, CSV |
| **3** | ✅ | Base de Conhecimento |
| **4** | ✅ | Geração com IA |
| **5** | ⏳ | Realização de Treinamentos |
| 6-13 | 📋 | Gamificação, Rankings, etc |

## Melhorias Futuras (Phases 5+)

### Fase 5: Realização
- Interface de quiz
- Salvamento de progresso
- Tipos de perguntas (true/false, essay, etc)
- Resultado e feedback
- Certificados

### Fase 6: Gamificação
- Pontos automáticos
- Níveis
- Badges
- Histórico

### Fase 7: Rankings
- Ranking geral
- Por área, departamento
- Histórico mensal

### Otimizações IA (futuro)
- Caching de respostas
- Batch processing
- Fine-tuning com dados da empresa
- Avaliação de respostas abertas com IA
- Sugestão de melhorias de treinamento

## Checklist Fase 4

- ✅ Serviço OpenAI com prompts otimizados
- ✅ Schema Zod para validação
- ✅ Database functions completas
- ✅ API endpoint completo
- ✅ UI com 4 passos
- ✅ Mock data para testing
- ✅ Tratamento robusto de erros
- ✅ Estimativa de custo
- ✅ Log de uso
- ✅ Documentação em prompts
- ⚠️ Rate limiting (próxima implementação)
- ⚠️ Edição de perguntas (próxima fase)

## Exemplo de Treinamento Gerado

```json
{
  "trainingTitle": "Venda Consultiva - Abordagem Estratégica",
  "description": "Desenvolvimento de habilidades consultivas para vendedores da área comercial com foco em abordagem estratégica e consultiva ao cliente",
  "learningObjectives": [
    "Dominar fundamentos da venda consultiva",
    "Identificar necessidades reais do cliente",
    "Apresentar soluções estratégicas e personalizadas",
    "Construir relacionamento de confiança duradouro"
  ],
  "contentSummary": "Este treinamento cobre as metodologias e práticas de venda consultiva, com ênfase em compreensão profunda do cliente, diagnóstico estratégico e apresentação de valor.",
  "estimatedDurationMinutes": 60,
  "suggestedMinPassScore": 70,
  "suggestedMaxPoints": 100,
  "questions": [
    {
      "type": "multiple_choice",
      "statement": "Qual é o primeiro passo da venda consultiva segundo o manual?",
      "options": [
        "Apresentar o produto imediatamente",
        "Fazer perguntas para entender necessidades do cliente",
        "Enviar proposta comercial",
        "Oferecer desconto como incentivo"
      ],
      "correctAnswer": 1,
      "explanation": "A venda consultiva começa com uma abordagem consultiva de fazer perguntas e entender as reais necessidades do cliente, conforme documentado no manual de venda consultiva, capítulo 2.",
      "difficulty": "basic",
      "points": 5,
      "sourceReference": "Manual de Venda Consultiva, Capítulo 2"
    },
    ...mais 14 perguntas
  ]
}
```

---

**Próxima fase:** Fase 5 - Realização de Treinamentos (Interface de Quiz, Salvamento, Certificados)
