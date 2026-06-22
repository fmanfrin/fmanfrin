# Fase 5: Realização de Treinamentos - RESUMO

**Status:** Implementação completa ✅
**Data:** Junho 2024
**Próximo passo:** Fase 6 (Gamificação)

## O Que Foi Criado

### 1. **Validações com Zod** ✅
- `lib/validations/attempt.ts`
- Schema para iniciar tentativa
- Schema para submeter resposta
- Schema para avaliar resposta
- Schema para enviar treinamento

### 2. **Database Functions** ✅
Adicionadas em `lib/db.ts`:
- `startTrainingAttempt()` - Iniciar nova tentativa
- `getTrainingAttempt()` - Obter tentativa
- `saveAnswer()` - Salvar resposta individual
- `submitTrainingAttempt()` - Submeter e calcular score
- `getTrainingResult()` - Resultado completo
- `getEmployeeTrainings()` - Listar treinamentos do colaborador

**Features:**
- ✅ Validação de máximo de tentativas
- ✅ Cálculo automático de score
- ✅ Salvamento automático de respostas
- ✅ Timestamp de início e fim
- ✅ Status de tentativa (in_progress, submitted, approved, rejected)

### 3. **API Endpoints** ✅

```
POST   /api/training-attempts                    → Iniciar tentativa
GET    /api/training-attempts/[id]               → Obter tentativa
PATCH  /api/training-attempts/[id]               → Submeter respostas
```

**Fluxo:**
1. POST inicia tentativa
   - Verifica max attempts
   - Cria record no banco
   - Retorna training com questions
2. PATCH submete resposta
   - Calcula score
   - Atualiza status
   - Retorna resultado

### 4. **Interface de Quiz** ✅
- `app/trainings/[id]/attempt/page.tsx`

**Features:**
- ✅ Exibição de pergunta atual
- ✅ Navegação anterior/próximo
- ✅ Barra de progresso
- ✅ Suporte a diferentes tipos (múltipla escolha, V/F, dissertativa)
- ✅ Salvamento automático de resposta
- ✅ Timer (se limite de tempo configurado)
- ✅ Contador de pontos

**Layout:**
- Header fixo com título e timer
- Barra de progresso
- Pergunta em destaque
- Opções de resposta (dinâmicas por tipo)
- Botões de navegação

### 5. **Página de Resultado** ✅
- `app/trainings/[id]/result/page.tsx`

**Mostra:**
- ✅ Status (Aprovado/Reprovado com ícone)
- ✅ Porcentagem obtida
- ✅ Pontos conquistados
- ✅ Nota mínima
- ✅ Barra visual de progresso
- ✅ Conquistas desbloqueadas (if aprovado)
- ✅ Próximos passos (if reprovado)
- ✅ Botão para tentar novamente
- ✅ Botão para baixar certificado (placeholder)

## Fluxo Completo de Realização

```
1. Colaborador clica em "Iniciar Treinamento"
   ↓
2. POST /api/training-attempts
   - Cria tentativa no banco
   - Valida max attempts
   - Retorna training + questions
   ↓
3. Página de Quiz carrega
   - Pergunta 1 de 15
   - Timer começa (se configurado)
   - Resposta salva automaticamente
   ↓
4. Colaborador navega pelas perguntas
   - Anterior/Próximo funcionam
   - Respostas preservadas ao navegar
   - Timer rodando
   ↓
5. Chega na última pergunta
   - Botão muda para "Enviar Treinamento"
   ↓
6. PATCH /api/training-attempts/[id]
   - Submete todas as respostas
   - Calcula score total
   - Determina status (approved/rejected)
   - Retorna resultado
   ↓
7. Página de Resultado mostra:
   - ✅ Aprovado ou ❌ Reprovado
   - Porcentagem e pontos
   - Conquistas (se aprovado)
   - Certificado (se aprovado)
```

## Tipos de Perguntas Suportados

### 1. **Múltipla Escolha**
- Radio buttons
- 4-5 opções
- Uma resposta correta
- Retorna índice da opção

### 2. **Verdadeiro/Falso**
- 2 radio buttons
- Boolean value
- Simples e rápido

### 3. **Resposta Curta**
- Text input
- Validação por keywords (próximas fases)
- String simples

### 4. **Dissertativa**
- Textarea
- Múltiplas linhas
- Avaliação manual ou por IA (próximas fases)

## Cálculo de Score

```typescript
Para cada resposta:
1. Buscar pergunta e seus pontos
2. Determinar se está correta
3. Adicionar pontos se correto
4. Somar todos os pontos

Total Score = Σ pontos conquistados
Max Score = Σ pontos de todas as perguntas
Percentage = (Total / Max) * 100

Status Aprovado se: Percentage >= min_pass_score (padrão 70%)
```

## Database Schema Afetado

```
training_attempts
├── id, training_id, employee_id
├── attempt_number, started_at, completed_at
├── score, max_score, percentage_score
├── status (in_progress, submitted, approved, rejected)
└── answers (JSON com todas as respostas)

training_answers
├── id, training_attempt_id, question_id
├── answer_value (string/number/array)
├── is_correct, points_awarded
└── created_at
```

## Interface de Usuário

### Página de Quiz (`/trainings/[id]/attempt`)

**Header (sticky):**
- Título do treinamento
- Timer (HH:MM se limite configurado)
- Barra de progresso (visual + percentual)

**Content:**
- Número da pergunta e tipo
- Pontos da pergunta
- Statement (enunciado)
- Opções de resposta (dinâmicas)

**Footer:**
- Botão "Anterior" (disabled na primeira)
- Espaço flexível
- Botão "Próxima" (ou "Enviar" na última)

### Página de Resultado (`/trainings/[id]/result`)

**Card Principal:**
- Ícone grande (✅ ou ❌)
- Título ("Parabéns!" ou "Não Aprovado")
- Descrição breve

**Score Section:**
- Percentual grande (80%)
- Pontos (120 de 150)
- Barra visual

**Details Grid:**
- Nota mínima (70%)
- Sua nota (80%)
- Status (✅)

**Achievements (if approved):**
- Lista de badges conquistadas
- Pontos adicionados

**Next Steps (if rejected):**
- Dicas para melhorar
- Botão para tentar novamente

## Tempo de Desenvolvimento

Fase 5 implementou:
- ~150 linhas: Validations
- ~200 linhas: Database functions
- ~150 linhas: API endpoints
- ~400 linhas: Quiz UI page
- ~300 linhas: Result page
- **Total:** ~1.200 linhas

## Segurança Implementada

- ✅ Autenticação obrigatória
- ✅ Validação de máximo de tentativas
- ✅ Verificação de acesso ao treinamento
- ✅ Score calculado no backend (não confiável no frontend)
- ✅ Resposta não perde ao navegar
- ✅ Status imutável após submissão

## Fases Implementadas

| Fase | Status | Features Completas |
|------|--------|-------------------|
| **1** | ✅ | Fundação, Auth, RLS, DB Schema |
| **2** | ✅ | Colaboradores, CSV, Áreas |
| **3** | ✅ | Base de Conhecimento, Upload |
| **4** | ✅ | Geração com IA, Treinamentos |
| **5** | ✅ | Realização, Quiz, Resultados |
| **6** | ⏳ | Gamificação (Pontos, Níveis, Badges) |
| 7-13 | 📋 | Rankings, Competições, Dashboards, etc |

## Próxima Fase: Gamificação

Fase 6 adicionará:
1. **Sistema de Pontos Automático**
   - Pontos por conclusão
   - Pontos por aprovação
   - Bonus por conclusão rápida

2. **Níveis de Conhecimento**
   - Iniciante → Elite
   - Atualização automática
   - Visual no dashboard

3. **Badges**
   - Primeiro treinamento
   - Nota máxima
   - Especialista em área
   - Evolução rápida

4. **Histórico**
   - Timeline de conquistas
   - Evolução visual
   - Estatísticas

## Checklist Fase 5

- ✅ Validações com Zod
- ✅ Database functions completas
- ✅ API endpoints (start, submit)
- ✅ Interface de quiz interativa
- ✅ Suporte a múltiplos tipos de perguntas
- ✅ Timer com countdown
- ✅ Salvamento automático de respostas
- ✅ Cálculo de score automático
- ✅ Página de resultado visual
- ✅ Certificado placeholder
- ✅ Tratamento de erros
- ✅ Responsive design
- ⚠️ Avaliação de respostas dissertativas com IA (próxima)
- ⚠️ Salvamento incremental de respostas (próxima)

## Exemplo de Fluxo Completo

**1. Colaborador inicia treinamento:**
```
POST /api/training-attempts
→ Cria tentativa, retorna training
```

**2. Vê primeira pergunta:**
```
"Qual é o primeiro passo da venda consultiva?"
- Apresentar produto
- [✓] Fazer perguntas
- Enviar proposta
- Oferecer desconto
```

**3. Seleciona resposta:**
```
setAnswers({ question-id: 1 }) ← salva automaticamente
```

**4. Navega para próxima:**
```
currentQuestion = 2
Respostas preservadas
```

**5. Responde todas as 15 perguntas**

**6. Clica "Enviar":**
```
PATCH /api/training-attempts/attempt-id
→ Calcula score
→ 80% aprovado
```

**7. Vê resultado:**
```
✅ Parabéns!
80% - 120 de 150 pontos
Badges: Primeiro Treinamento, Nota Máxima
Botão: Baixar Certificado
```

---

**Próxima fase:** Fase 6 - Gamificação (Pontos, Níveis, Badges, Histórico)

**Progresso Overall:** 5 de 13 fases = 38% da plataforma completa
