# Fase 3: Base de Conhecimento - RESUMO

**Status:** Estrutura completa implementada ✅
**Data:** Junho 2024
**Próximo passo:** Fase 4 (Geração com IA)

## O Que Foi Criado

### 1. **Validações com Zod** ✅
- `lib/validations/content.ts`
  - `createContentSourceSchema` - Criação de conteúdo
  - `contentFilterSchema` - Filtros de busca e paginação
  - Suporte para tipos: text, pdf, docx, pptx, txt, markdown, url

### 2. **Serviço de Extração de Texto** ✅
- `lib/services/text-extraction.ts`
  - **Funcionalidades:**
    - ✅ Suporte nativo: TXT, Markdown, Plain Text
    - ⚠️ Suporte planejado: PDF (pdfjs-dist), DOCX (mammoth), PPTX (pptxjs)
    - Validação de arquivo (tipo, tamanho máximo 10MB)
    - Limpeza de texto extraído
    - Estatísticas de texto (palavras, caracteres, parágrafos)
    - Mensagens de erro claras

### 3. **Database Functions** ✅
Adicionadas a `lib/db.ts`:
- `createContentSource()` - Criar novo conteúdo
- `listContentSources()` - Listar com filtros
- `getContentSource()` - Buscar por ID
- `updateContentSource()` - Atualizar conteúdo
- `publishContentSource()` - Publicar conteúdo
- `archiveContentSource()` - Arquivar conteúdo

**Features:**
- ✅ Paginação automática
- ✅ Busca por título/descrição
- ✅ Filtros por categoria, status, tipo
- ✅ Versionamento (campo version)
- ✅ Rastreamento de autor
- ✅ Timestamps (created_at, updated_at)

### 4. **API Endpoints REST** ✅

```
POST   /api/content-sources              → Criar conteúdo (texto direto)
GET    /api/content-sources              → Listar com filtros
POST   /api/content-sources/upload       → Upload de arquivo com extração
GET    /api/content-sources/[id]         → Obter detalhe
PATCH  /api/content-sources/[id]         → Atualizar conteúdo
```

**Features dos endpoints:**
- ✅ Autenticação obrigatória (getSession)
- ✅ Validação com Zod
- ✅ Suporte a paginação
- ✅ Upload de arquivo (com validação)
- ✅ Extração automática de texto
- ✅ Armazenamento em Supabase Storage
- ✅ Tratamento robusto de erros

### 5. **Página de Interface** ✅
- `app/admin/knowledge-base/page.tsx`

**Duas abas:**
1. **Conteúdos (📚)**
   - Listar todos os conteúdos (implementação de API)
   - Filtros por categoria, status, busca
   - Visualizar detalhes

2. **Enviar Novo (📤)**
   - Formulário completo de upload
   - Campos: título, descrição, categoria, tags, arquivo
   - Validação no frontend
   - Drag-and-drop para arquivo
   - Informações sobre tipos suportados
   - Feedback visual (erros, sucesso)

### 6. **Arquitetura Multi-Arquivo**

```
Frontend
├── app/admin/knowledge-base/ → Interface de usuário
│   ├── Browse conteúdos
│   └── Enviar novo arquivo

API Routes
├── /api/content-sources → CRUD completo
├── /api/content-sources/upload → Upload com extração
└── /api/content-sources/[id] → Detalhe e atualização

Backend Services
├── lib/db.ts → Database queries
└── lib/services/text-extraction.ts → Extração de texto

Storage
├── Supabase Storage (bucket: content-files)
└── RLS para acesso privado por organização

Database
└── content_sources → Tabela principal
    └── content_source_versions → Histórico de versões
```

## Fluxo de Upload

```
1. Usuário seleciona arquivo
2. Frontend valida (tamanho, tipo)
3. FormData enviado para /api/content-sources/upload
4. Backend valida arquivo novamente
5. Arquivo é armazenado em Supabase Storage
6. Texto é extraído (nativo ou biblioteca)
7. Texto é limpo e estatísticas geradas
8. Record é salvo em content_sources com:
   - Caminho do arquivo em Storage
   - Texto extraído
   - Metadados (autor, timestamp)
9. Resposta ao cliente com:
   - Content record
   - Extraction stats (palavras, caracteres, preview)
```

## Estrutura de Dados

### Tabela: content_sources
```sql
id                  UUID PRIMARY KEY
organization_id     UUID (multi-tenant)
title               TEXT (obrigatório)
description         TEXT (opcional)
category            TEXT
tags                TEXT[]
type                VARCHAR (text, pdf, docx, pptx, txt, markdown, url)
content_text        TEXT (texto extraído)
file_storage_path   TEXT (caminho em Storage)
version             INTEGER
author_id           UUID
status              VARCHAR (draft, review, published, archived)
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### Bucket: content-files (Supabase Storage)
```
content-files/
├── {organization_id}/
│   ├── 1718xxx-documento.pdf
│   ├── 1718xxx-manual.docx
│   └── 1718xxx-slides.pptx
```

## Como Funciona - Casos de Uso

### Caso 1: Upload de Texto Direto
```
1. Admin digita texto na interface
2. FormData enviado com contentText
3. Texto é salvo direto no banco
4. Sem upload de arquivo
```

### Caso 2: Upload de TXT ou Markdown
```
1. Admin seleciona arquivo
2. Frontend valida (10MB max, extensão)
3. File.text() extrai conteúdo
4. Texto é limpado
5. Arquivo salvo em Storage
6. Record salvo no banco com texto extraído
```

### Caso 3: Upload de PDF (futuro)
```
1. Admin seleciona PDF
2. Frontend valida
3. Backend instala pdfjs-dist
4. Extrai texto com biblioteca
5. Resto do fluxo igual
```

## Integrações Planejadas (Fase 4)

- **Geração com IA:**
  - IA lerá conteúdo_text da tabela
  - Gerará perguntas baseadas no texto
  - Criará treinamentos automáticos

- **Full-Text Search:**
  - Índice em content_text
  - Busca rápida em grandes bases

- **OCR para PDFs escaneados:**
  - Detectar se PDF tem texto
  - Se não tiver, alertar usuário
  - Futura integração com Tesseract

## Segurança Implementada

- ✅ Autenticação obrigatória
- ✅ Validação de tipo de arquivo
- ✅ Limite de tamanho (10MB)
- ✅ Armazenamento em Storage privado (RLS)
- ✅ Acesso organização-específico
- ✅ Sem exposição de caminhos de arquivo

## Teste da Fase 3

### 1. Criar Conteúdo com Texto Direto
```bash
curl -X POST http://localhost:3000/api/content-sources \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-id",
    "title": "Fundamentos de Vendas",
    "description": "Básico para iniciantes",
    "category": "vendas",
    "type": "text",
    "contentText": "Lorem ipsum dolor sit amet..."
  }'
```

### 2. Listar Conteúdos
```bash
curl "http://localhost:3000/api/content-sources?organizationId=org-id&category=vendas&page=1&limit=20"
```

### 3. Upload de Arquivo (com FormData)
```bash
curl -X POST http://localhost:3000/api/content-sources/upload \
  -F "file=@documento.txt" \
  -F "organizationId=org-id" \
  -F "title=Meu Documento" \
  -F "category=operacao"
```

### 4. Obter Detalhe de Conteúdo
```bash
curl "http://localhost:3000/api/content-sources/content-id"
```

### 5. Atualizar Conteúdo
```bash
curl -X PATCH http://localhost:3000/api/content-sources/content-id \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Nova descrição",
    "status": "published"
  }'
```

## Setup Supabase Storage

**Necessário fazer uma vez:**

```sql
-- Criar bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-files', 'content-files', false);

-- RLS Policy: Usuários só acessam arquivos da sua organização
CREATE POLICY "Users can access content files of their org"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'content-files'
  AND (
    -- Decompor organization_id do caminho: "org-id/..."
    split_part(name, '/', 1) IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid()
    )
  )
);
```

## Próximas Ações - Fase 4

### Integração OpenAI para Geração de Treinamentos

1. **Criar serviço de IA**
   - `lib/ai/training-generator.ts`
   - Ler conteúdo_text
   - Enviar para ChatGPT
   - Gerar perguntas estruturadas

2. **API endpoint**
   - POST `/api/trainings/generate-with-ai`
   - Recebe: content_ids, config
   - Retorna: training com perguntas

3. **Interface**
   - `app/admin/trainings/create-with-ai`
   - Selecionar conteúdos
   - Configurar parâmetros
   - Preview de perguntas
   - Editar antes publicar

## Linhas de Código Adicionadas

- ~150 linhas: Validations
- ~200 linhas: Database functions
- ~250 linhas: Text extraction service
- ~200 linhas: API endpoints
- ~350 linhas: Frontend UI
- **Total Fase 3:** ~1.150 linhas

## Fases Implementadas até Agora

| Fase | Status | Pronto para |
|------|--------|-------------|
| **1** | ✅ Completa | Banco, Auth, RLS |
| **2** | ✅ Completa | Colaboradores, CSV |
| **3** | ✅ Completa | Base de conhecimento, upload |
| **4** | ⏳ Próxima | Geração com IA |
| 5-13 | ⏳ Planejadas | Treinamentos, gamificação, etc |

## Notas Importantes

- 📦 Para suportar PDF/DOCX/PPTX, instale:
  ```bash
  npm install pdfjs-dist mammoth pptxjs
  ```

- 📁 Supabase Storage bucket precisa ser criado manualmente

- 🔐 RLS policies garantem que usuários só vejam conteúdos da sua org

- 📝 Texto extraído é limpo e pronto para IA na próxima fase

- ⚡ Extração de texto é síncrona (OK para 10MB)

## Checklist da Fase 3

- ✅ Validações com Zod
- ✅ Database functions para CRUD
- ✅ Serviço de extração de texto
- ✅ API endpoints (CRUD + upload)
- ✅ Página de interface (upload)
- ✅ Suporte a filtros e busca
- ✅ Armazenamento em Storage
- ✅ Metadados (autor, timestamps)
- ✅ Versionamento preparado
- ⚠️ Bibliotecas de extração (pendente: npm install)
- ⚠️ OCR para PDFs escaneados (futuro)

---

**Próxima fase:** Fase 4 - Geração de Treinamentos com IA (OpenAI)
