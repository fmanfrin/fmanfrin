# 🔍 Code Review - Elevare Treinamentos

## Problemas Encontrados e Recomendações

### 🔴 CRÍTICOS - CORRIGIR JÁ!

#### 1. **CPF em Plain Text no Seed Demo**
**Arquivo:** `scripts/seed-demo.ts`

```typescript
// ❌ ERRADO - CPF em plain text:
cpf_hash: emp.cpf,

// ✅ CORRETO:
import { hashCPF } from '../lib/security/cpf-validator';
cpf_hash: hashCPF(emp.cpf),
```

---

#### 2. **Missing Imports em Services**
**Arquivos:** `lib/services/ranking.ts`, `lib/services/competition.ts`, `lib/services/dashboard.ts`

```typescript
// ❌ FALTA no início:
import { supabase } from '../supabase';
```

---

#### 3. **Rate Limiter em Serverless - Falha de Design**
**Arquivo:** `lib/security/rate-limiter.ts`

**Problema:** Store em memória local + setInterval não funciona bem em Vercel

```typescript
// ✅ SOLUÇÃO: Usar Supabase para persistência
export async function isRateLimited(key: string, config: RateLimitConfig): boolean {
  const { data: record } = await supabase
    .from('rate_limit_records')
    .select('*')
    .eq('key', key)
    .single();
  
  const now = Date.now();
  
  if (!record || now >= record.reset_time) {
    await supabase.from('rate_limit_records').upsert({
      key,
      count: 1,
      reset_time: now + config.windowMs,
    });
    return false;
  }
  
  if (record.count >= config.maxRequests) {
    return true;
  }
  
  await supabase.from('rate_limit_records').update({ count: record.count + 1 }).eq('key', key);
  return false;
}
```

---

#### 4. **Falta Function getEmployeeByUserId**
**Arquivo:** Usada em múltiplos endpoints mas não existe em `lib/db.ts`

```typescript
// ✅ ADICIONAR em lib/db.ts:
export async function getEmployeeByUserId(userId: string) {
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (!employee) throw new Error('Employee not found');
  return employee;
}
```

---

#### 5. **RLS Check Faltando em Dashboard**
**Arquivo:** `lib/services/dashboard.ts`

```typescript
// ❌ ANTES - Sem RLS:
const { data: employee } = await supabase
  .from('employees')
  .select('*')
  .eq('id', emp.id)
  .single();

// ✅ DEPOIS - Com RLS:
const { data: employee } = await supabase
  .from('employees')
  .select('*')
  .eq('id', emp.id)
  .eq('organization_id', organizationId)
  .single();
```

---

#### 6. **Missing Error Handling em JSON Parse**
**Arquivo:** `app/api/reports/generate/route.ts` e outros

```typescript
// ❌ ANTES:
const body = await request.json();

// ✅ DEPOIS:
let body;
try {
  body = await request.json();
} catch (err) {
  return NextResponse.json(
    { error: 'Invalid JSON' },
    { status: 400 }
  );
}
```

---

### 🟡 IMPORTANTES - CORRIGIR ANTES DE DEPLOY

#### 7. **CPF Inválido em Seed Demo**
**Arquivo:** `scripts/seed-demo.ts`

```typescript
// ❌ ERRADO - Dígitos verificadores inválidos:
cpf: '12345678901',
cpf: '12345678902',

// ✅ CERTO - CPFs fictícios válidos:
cpf: '11144477735',
cpf: '22233344456',
```

---

#### 8. **Audit Log Faltando em Relatórios**
**Arquivo:** `app/api/reports/generate/route.ts`

```typescript
// ✅ ADICIONAR depois de gerar:
await logDataExport(
  employee.organization_id,
  session.user.id,
  selectedReport,
  data.length,
  request.headers.get('x-forwarded-for')
);
```

---

#### 9. **Sanitização - Stack Overflow Risk**
**Arquivo:** `lib/security/sanitize.ts`

```typescript
// ✅ ADICIONAR limite de profundidade:
const MAX_DEPTH = 10;

export function sanitizeObject(obj: any, depth = 0): any {
  if (depth > MAX_DEPTH) {
    console.warn('Max sanitization depth exceeded');
    return obj;
  }
  // ... resto
}
```

---

#### 10. **Sem Try-Catch em Zod Validation**
**Arquivo:** `app/api/competitions/route.ts` e outros

```typescript
// ✅ ADICIONAR:
try {
  const validated = createCompetitionSchema.parse(body);
} catch (err) {
  if (err instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', issues: err.issues },
      { status: 400 }
    );
  }
  throw err;
}
```

---

### 🔵 RECOMENDAÇÕES - MELHORIAS

#### 11. **Adicionar Logging em Todas as Mutações**
```typescript
// Em checkAndAwardBadges, updateLevel, etc:
try {
  await supabase.from('...').insert(...);
} catch (err) {
  await logAuditEvent({
    action: 'badge_award_failed',
    status: 'failed',
    description: err.message,
  });
  throw err;
}
```

---

#### 12. **Implementar Paginação em Relatórios Grandes**
```typescript
// Para > 10k registros:
const limit = 10000;
const offset = (page - 1) * limit;

const { data, count } = await supabase
  .from('...')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1);
```

---

#### 13. **Usar Transactions em Operações Críticas**
```typescript
// Gamificação deveria ser atomic:
const { error } = await supabase.rpc('award_points_and_update_level', {
  employee_id: employeeId,
  organization_id: organizationId,
  points: pointsAmount,
});
```

---

## 📋 Checklist de Correções

### 🔴 CRÍTICAS (HOJE)
- [ ] Hash CPF em seed-demo.ts (usar hashCPF)
- [ ] Adicionar import { supabase } em services
- [ ] Implementar getEmployeeByUserId em lib/db.ts
- [ ] Usar Supabase para rate-limiter (não memória local)
- [ ] Adicionar RLS checks em dashboard queries

### 🟡 IMPORTANTES (SEMANA)
- [ ] Try-catch em JSON.parse em todos endpoints
- [ ] Validar CPFs em seed-demo (gerar válidos)
- [ ] Adicionar logDataExport em relatórios
- [ ] Limite de profundidade em sanitizeObject
- [ ] Try-catch em Zod validation

### 🔵 RECOMENDADAS (ANTES DO DEPLOY)
- [ ] Logging em operações críticas
- [ ] Paginação em relatórios
- [ ] Transactions em gamificação
- [ ] Performance testing
- [ ] Security audit

---

## 🚀 Impacto

**Sem fixes críticos:** Pode quebrar em produção
**Sem fixes importantes:** Segurança e auditoria comprometidas
**Recomendações:** Melhoram performance e manutenibilidade

---

## ✅ Próximos Passos

1. Aplicar todos os fixes críticos
2. Testar com seed-demo
3. Rodar build (`npm run build`)
4. Fazer code review final
5. Deploy para produção

