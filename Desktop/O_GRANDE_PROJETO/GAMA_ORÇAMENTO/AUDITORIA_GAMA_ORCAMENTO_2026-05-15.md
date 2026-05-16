# Auditoria GAMA Orçamento — Estado Atual do Projeto
**Data:** 2026-05-15  
**Auditor:** @aios-master (Orion)  
**Status:** CONCLUSÃO RECOMENDADA: **REFATORAÇÃO (Tier 2)**  

---

## 🎯 Resumo Executivo

**Recomendação:** REFATORAR (não reescrever)

GAMA Orçamento é um **projeto viável com arquitetura adequada** mas com **3 gargalos críticos** que impedem escalabilidade para múltiplos clientes/usuários:

1. **Sem banco de dados** (localStorage apenas) — Impossível multi-user
2. **Lógica de precificação fragmentada** em 15+ arquivos MD sem código executável
3. **Design System desacoplado** — CSS custom inline, sem tokens GAMA DS V3

**Esforço de refatoração:** 4-6 semanas (Tier 2)  
**Resultado:** MVP pronto para produção + clientes reais

---

## Dimensão 1 — Stack e Infraestrutura ✅

### Framework e Linguagem
- **Framework:** Next.js 15.0.3 (App Router)
- **Linguagem:** TypeScript 5.6.3 (strict mode ✅)
- **Runtime:** Node.js 18+
- **Porta:** 3002 (dev e prod)

### Dependências
| Pacote | Versão | Status |
|--------|--------|--------|
| next | 15.0.3 | ✅ Atualizado |
| react | 18.3.1 | ✅ Atualizado |
| typescript | 5.6.3 | ✅ Atualizado |
| html2pdf.js | 0.14.0 | ⚠️ Desatualizado (2019) |

### Persistência
- **Banco de Dados:** ❌ NENHUM
- **Storage:** localStorage (browser only)
- **Keys:** 5 chaves principais
  - `gama_orcamentos` — array de orçamentos
  - `gama_orcamentos_trash` — soft delete
  - `gama_empresa` — dados da empresa
  - `gama_catalogo` — itens de catálogo
  - `gama_pricing_config` — configuração de preços

### Testes e CI/CD
| Aspecto | Status | Impacto |
|--------|--------|--------|
| Testes unitários | ❌ Nenhum | CRÍTICO |
| Testes E2E | ❌ Nenhum | CRÍTICO |
| Linting | ✅ `next lint` | OK |
| CI/CD | ❌ Nenhum | CRÍTICO para produção |
| Build scripts | ✅ build, start | OK |

### Está registrado em GAMA_MONITOR?
❌ Não encontrado em `GAMA_MONITOR` — precisa ser adicionado à ports 3002

---

## Dimensão 2 — Modelo de Dados 📊

### Tabelas/Entidades (localStorage)

#### 1. **Orcamento** (Orçamento)
```typescript
{
  id: string;
  numero: string;
  status: "Aprovado" | "Pendente" | "Rejeitado" | "Rascunho";
  empresa: Empresa;
  cliente: Cliente;
  itens: OrcamentoItem[];
  datas: { emissao, validade };
  desconto_percentual: number;
  termos: string;
  garantia: string;
  criado_em: ISO string;
  atualizado_em: ISO string;
}
```
**Registros aprox.:** 0-50 (em memória)

#### 2. **OrcamentoItem** (Itens de linha)
```typescript
{
  id: string;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
}
```

#### 3. **Empresa** (Dados da empresa)
```typescript
{
  nome: string;
  logo_text: string;
  logo_url?: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  instagram?: string;
}
```

#### 4. **Cliente** (Dados do cliente)
```typescript
{
  nome: string;
  cpf_cnpj: string;
  contato: string;
  email: string;
  endereco: string;
  instagram?: string;
}
```

#### 5. **CatalogItem** (Itens do catálogo)
```typescript
{
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  tipo_precificacao: "hora" | "fixo" | "pacote";
  horas_estimadas?: number;
  custo_execucao?: number;
  custos_variaveis?: number;
  overhead_valor?: number;
  overhead_pct?: number;
  margem_pct?: number;
  preco_custo?: number;
}
```
**Registros aprox.:** 8-50 (em memória)

#### 6. **PricingConfig** (Configuração de preços)
```typescript
{
  taxa_horaria: number;
  horas_medias_projeto: number;
  projetos_por_mes: number;
  margem_padrao: number;
  custos_fixos: CustoFixo[];
  unidades_faturamento?: { ... };
}
```

#### 7. **OrcamentoVersion** (Versionamento)
```typescript
{
  id: string;
  orcamento_id: string;
  orcamento: Orcamento;
  versao_numero: number;
  motivo: string;
  criado_em: ISO string;
  criado_por?: string;
}
```

#### 8. **CatalogSnapshot** (Snapshots de catálogo)
```typescript
{
  id: string;
  data: ISO string;
  itens: CatalogItem[];
}
```

### Relação entre Tabelas

```
Orcamento
├── Empresa (1:1)
├── Cliente (1:1)
├── OrcamentoItem[] (1:N)
└── OrcamentoVersion[] (1:N)

CatalogItem (independente)
└── CatalogSnapshot[] (1:N)

PricingConfig (singleton)
```

### Soft Delete Pattern
- Orçamentos deletados → `gama_orcamentos_trash`
- Função `restoreFromTrash()` — recuperação reversível
- Função `deletePermanently()` — limpeza final

---

## Dimensão 3 — Lógica de Precificação 💰

### Código de Precificação: ❌ AUSENTE

**BLOQUEADOR CRÍTICO:** A lógica de precificação está **documentada em 15+ arquivos .md** (Markdown) mas **NÃO implementada em código TypeScript**:

### Documentos Encontrados (Não-Executáveis)
| Arquivo | Tamanho | Propósito |
|---------|---------|-----------|
| FORMULA_MESTRE_120H.md | 9.3 KB | Definição da taxa base R$ 120/h |
| FRAMEWORK_PERSONALIZADO_GAMA.md | 12.4 KB | Estrutura completa de precificação |
| GUIA_RAPIDO_PRECIFICACAO.md | 2.6 KB | Quick reference |
| TABELA_PRECOS_FINAL_3TIERS.md | 5.5 KB | Preços por tier |
| CALCULO_CUSTOS_OPERACIONAIS.md | 5.9 KB | Custos fixos |
| PLANEJAMENTO_ATOMICO.md | 4.4 KB | Planejamento por percentual |
| PRECIFICACAO_UNITARIA_CORRETA.md | 4.9 KB | Unitária detalhada |
| **TOTAL** | **~45 KB** | **Apenas documentação** |

### O que está implementado:
- ✅ `utils.ts` — Formatadores de moeda (fmt)
- ✅ `storage.ts` — Persistência de PricingConfig
- ✅ `types/orcamento.ts` — Interfaces (CatalogItem tem campos)
- ❌ Função `calculatePrice()` — AUSENTE
- ❌ Função `applyOverhead()` — AUSENTE
- ❌ Função `applyMargin()` — AUSENTE
- ❌ Função `calculateCostDilution()` — AUSENTE

### Modelo de Precificação (Documentado)
```
Base: R$ 120/h (operacional)

Taxa Horária + Overhead + Margem = Preço
  ↓
Exemplo: Design (30h)
  Custo: 30 × 120 = R$ 3.600
  Overhead: +20% = R$ 720
  Margem: +35% = R$ 1.512
  ───────────────────────────
  PREÇO FINAL: R$ 5.832

Fidelity Dilution (Contratos 6 meses):
  TIER 1 (Projeto de 6 meses): ÷6
  TIER 2 (Projeto mensal): ÷1
  TIER 3 (Avulso): ×1.5
```

### Recomendação
⚠️ **IMPLEMENTAR engine de precificação** antes de usar em produção:
1. Migrar lógica de `.md` para funções TypeScript
2. Adicionar testes unitários
3. Expor via API em `/api/calcular-preco`

---

## Dimensão 4 — Funcionalidades Existentes ✨

### Rotas e Páginas Implementadas

| Rota | Página | Status | Funcionalidade |
|------|--------|--------|-----------------|
| `/` | `page.tsx` (304 linhas) | ✅ Ativa | Listagem principal, busca, filtro por status |
| `/novo` | `novo/page.tsx` | ✅ Ativa | Criar novo orçamento |
| `/[id]/editar` | `[id]/editar/page.tsx` | ✅ Ativa | Editar orçamento |
| `/[id]/preview` | `[id]/preview/page.tsx` | ✅ Ativa | Visualizar orçamento (print) |
| `/[id]/historico` | `[id]/historico/page.tsx` | ✅ Ativa | Ver versões anteriores |
| `/[id]/comparar` | `[id]/comparar/page.tsx` | ✅ Ativa | Comparar 2 orçamentos |
| `/[id]/versao/[versao]` | Versão específica | ✅ Ativa | Restaurar versão |
| `/catalogo` | `catalogo/page.tsx` | ✅ Ativa | Gerenciador de catálogo |
| `/catalogo/novo` | `catalogo/novo/page.tsx` | ✅ Ativa | Novo item |
| `/catalogo/[id]/editar` | Editar item | ✅ Ativa | Editar catálogo |
| `/catalogo/lixeira` | Trash | ✅ Ativa | Items deletados |
| `/empresa` | `empresa/page.tsx` | ✅ Ativa | Dados da empresa |
| `/configuracoes/precificacao` | Pricing config | ✅ Ativa | Configurar preços |
| `/lixeira` | Trash | ✅ Ativa | Orçamentos deletados |
| `/exportar` | `exportar/page.tsx` | ✅ Ativa | PDF/print |
| `/debug` | Debug page | 🔧 Debug only | Informações técnicas |

### Funcionalidades Implementadas
- ✅ CRUD completo para orçamentos
- ✅ CRUD para catálogo
- ✅ Soft delete + restore
- ✅ Versionamento com histórico
- ✅ Busca e filtro por cliente/número
- ✅ Grouping por data de emissão
- ✅ Duplicar orçamento
- ✅ Comparação entre 2 orçamentos
- ✅ Cálculo de total com desconto
- ✅ Exportação PDF (html2pdf)
- ✅ Masking de CPF/CNPJ
- ✅ Formatação de moeda
- ✅ Datas dinâmicas (hoje, +30 dias)

### Funcionalidades NÃO Implementadas (Missing)
- ❌ **Cálculo automático de preço** (vide Dimensão 3)
- ❌ **API REST** (tudo é client-side)
- ❌ **Autenticação/Autorização**
- ❌ **Multi-tenant** (um usuário por browser)
- ❌ **Sync com backend**
- ❌ **Offline-first** (sem SW)
- ❌ **Mobile app**
- ❌ **Integração com sistemas** (Stripe, NF-e, etc)

---

## Dimensão 5 — Telas e Interface 🎨

### Telas Existentes

#### 1. **Homepage** (`/`)
- Listagem de orçamentos agrupada por data
- Busca por cliente/número
- Status counters (Aprovado, Pendente, Rejeitado, Rascunho)
- Ações: editar, duplicar, deletar
- Total geral de orçamentos
- **Tamanho:** 304 linhas
- **Complexidade:** MÉDIA (grouping, sorting, filtering)

#### 2. **Novo Orçamento** (`/novo`)
- Formulário simples (wrapper)
- Delega para StudioEditor
- **Tamanho:** 30 linhas (thin wrapper)

#### 3. **Editar Orçamento** (`/[id]/editar`)
- Full editor com StudioEditor
- Salva em localStorage
- Versionamento automático
- **Usado por:** StudioEditor.tsx (687 linhas)

#### 4. **Preview** (`/[id]/preview`)
- Template de impressão
- Componentes: BudgetTemplate, OrcamentoDoc
- Estilizado para print
- **Usado por:** BudgetTemplate.tsx

#### 5. **Histórico** (`/[id]/historico`)
- Lista versões antigas
- Links para restaurar/comparar
- Timeline visual

#### 6. **Comparação** (`/[id]/comparar`)
- Side-by-side de 2 orçamentos
- Diferenças destacadas

#### 7. **Catálogo** (`/catalogo`)
- CRUD de itens
- Filtro por categoria
- Preço + overhead + margem
- Tipo de precificação (hora/fixo/pacote)

#### 8. **Empresa** (`/empresa`)
- Dados: nome, CNPJ, logo, contato
- Salva em localStorage

#### 9. **Configurações** (`/configuracoes/precificacao`)
- Taxa horária (R$ 120/h)
- Horas médias por projeto
- Projetos por mês
- Margem padrão
- Custos fixos (array)

#### 10. **Lixeira** (`/lixeira`, `/catalogo/lixeira`)
- Items deletados
- Restore + delete permanente

### Componentes UI

| Componente | Linhas | Propósito |
|-----------|--------|-----------|
| StudioEditor.tsx | 687 | Editor principal (MONOLÍTICO) |
| BudgetTemplate.tsx | ? | Template de impressão |
| OrcamentoDoc.tsx | ? | Documento orçamento |
| DateSelectorModal.tsx | ? | Modal de seleção de data |

### Design System

**Status:** ❌ Desacoplado de GAMA DS V3

- **Cores:** Custom CSS variables (--primary: #88ce11 GAMA green)
- **Tipografia:** System font (-apple-system, Segoe UI)
- **Spacing:** Custom (sem scale padronizado)
- **Componentes:** Nenhum uso de GAMA DS
- **Dark theme:** Hardcoded (--bg: #111111)

**Impacto:** Design inconsistente com resto do GAMA ecosystem

---

## Dimensão 6 — Qualidade de Código 🔍

### Estrutura de Pastas
```
src/
├── app/              # 15 rotas/páginas
├── components/       # 4 componentes grandes
├── lib/              # 2 arquivos: storage.ts (100 linhas), utils.ts (60 linhas)
└── types/            # 1 arquivo: orcamento.ts (112 linhas)
```

### TypeScript
- ✅ Strict mode ativo
- ✅ Tipos definidos (interfaces completas)
- ✅ Type safety em storage functions
- ❌ No validation library (zod, io-ts)
- ❌ No error handling (try/catch mínimo)

### Padrões de Código

#### ✅ BOM
- Client components com "use client"
- TypeScript strict
- Functional components
- Custom hooks (useState, useEffect)
- Formato de currency padronizado (Intl.NumberFormat)

#### ⚠️ MELHORAR
- **StudioEditor é MONOLÍTICO** (687 linhas)
  - Deveria ser 5-6 componentes menores
  - Sem separação de concerns
  
- **Lógica de cálculo ausente**
  - Não há `calculatePrice()`, `applyMargin()`, etc
  - Tudo é manual no editor
  
- **Storage acoplado a localStorage**
  - Sem abstração (Service pattern)
  - Impossível trocar para backend depois
  
- **Sem validação de entrada**
  - CPF/CNPJ masking mas sem validação
  - Quantidades negativas não bloqueadas
  
- **Sem testes**
  - 0% coverage
  - Mudança qualquer quebra tudo

#### ❌ CRÍTICO
- **Nenhuma API REST**
  - Tudo client-side
  - localStorage é single-user
  
- **Date handling manual**
  - UTC issues em browsers
  - Parsing propenso a bugs
  
- **Nenhuma documentação inline**
  - Arquivo FRAMEWORK_*.md é externo
  - Dev novo fica perdido
  
- **html2pdf desatualizado** (2019)
  - Dependência de segurança pendente

### Code Duplication
- ✅ Baixo (tipos bem definidos)
- ⚠️ MÉDIO em components (cada rota copia state management)

### Performance
- ✅ Bundle pequeno (Next.js otimizado)
- ✅ Lazy loading automático (App Router)
- ⚠️ MÚLTIPLOS re-renders em StudioEditor
- ❌ Sem caching/memoization

---

## Dimensão 7 — Identidade Visual 🎭

### Conformidade com GAMA DS
**Status:** ❌ 20% (cores apenas)

| Elemento | GAMA DS V3 | GAMA Orcamento | Alinhamento |
|----------|-----------|----------------|------------|
| Cores | 12 tokens | 12 custom vars | ❌ Duplicadas |
| Tipografia | 4 scales | System fonts | ❌ Não alinhada |
| Spacing | 8-unit scale | Valores aleatórios | ❌ Inconsistente |
| Componentes | 40+ button/card/modal | 0 reutilizados | ❌ Nenhum |
| Ícones | Lucide (1000+) | Nenhum | ❌ Ausente |
| Tema | Light/Dark tokens | Dark hardcoded | ⚠️ Parcial |

### CSS Atual

**Arquivo:** `globals.css` (47 linhas)

```css
/* Dark theme hardcoded */
:root {
  --primary: #88ce11;      /* GAMA green ✅ */
  --bg: #111111;           /* Custom ❌ */
  --surface: #1c1c1c;      /* Custom ❌ */
  --border: rgba(...);     /* Custom ❌ */
  --radius: 12px;          /* Custom ❌ */
}

/* Global reset */
* { box-sizing, margin, padding... }

/* Scrollbar styling */
::-webkit-scrollbar { ... }

/* Print media */
@media print { .no-print { display: none; } }
```

### Impacto
- ⚠️ **Inconsistência visual** com GAMA ecosystem
- ⚠️ **Não segue design tokens** de GAMA DS V3
- ⚠️ **Impossível mudar tema** (light/dark hardcoded)
- ✅ **Funciona** mas **sem manutenibilidade**

### Recomendação
Migrar para GAMA DS V3 tokens:
```css
:root {
  --gama-primary: var(--gama-ds-primary);    /* Importar de DS */
  --gama-bg: var(--gama-ds-bg-01);           /* Importar de DS */
  --gama-text: var(--gama-ds-text-primary);  /* Importar de DS */
  --gama-radius: var(--gama-ds-radius-md);   /* Importar de DS */
}
```

---

## 📊 Resumo por Dimensão

| Dimensão | Score | Status | Bloqueador |
|-----------|-------|--------|-----------|
| **1. Stack** | 7/10 | ✅ BOM | ❌ Sem BD |
| **2. Dados** | 8/10 | ✅ BOM | ⚠️ Só localStorage |
| **3. Precificação** | 2/10 | ❌ CRÍTICO | ❌ AUSENTE em código |
| **4. Features** | 8/10 | ✅ BOM | ❌ Sem API |
| **5. Telas** | 6/10 | ⚠️ OK | ❌ Design desacoplado |
| **6. Código** | 5/10 | ⚠️ ALERTA | ❌ 0 testes |
| **7. Identity** | 2/10 | ❌ CRÍTICO | ❌ Sem tokens DS |
| **TOTAL** | **4.6/10** | ⚠️ **VIÁVEL COM REFACTOR** | 3 críticos |

---

## 🎯 Recomendação Final

### Decisão: **REFATORAR (Tier 2)**

**Não reescrever do zero** porque:
- ✅ Lógica de negócio está correta (CRUD, versionamento, soft delete)
- ✅ UI é funcional e navegável
- ✅ TypeScript está bem estruturado
- ✅ Escolhas arquiteturais são sensatas

**Precisa refatorar porque:**
- ❌ Precificação é documento, não código
- ❌ localStorage não escala para múltiplos usuários
- ❌ StudioEditor é monolítico (687 linhas)
- ❌ Sem testes (0% coverage)
- ❌ Design desacoplado de GAMA DS
- ❌ Não há API REST

### Fases de Refatoração (4-6 semanas)

**Phase 1: Backend + Precificação (1-2 semanas)**
- [ ] Criar PostgreSQL schema (copy localStorage structure)
- [ ] Migrar storage.ts → supabase client
- [ ] Implementar engine de precificação (TypeScript)
- [ ] Adicionar testes unitários

**Phase 2: API REST (1 semana)**
- [ ] Criar `/api/orcamentos` CRUD
- [ ] Criar `/api/catalogo` CRUD
- [ ] Autenticação simples (JWT)
- [ ] Validação com zod

**Phase 3: UI Refactor (1-2 semanas)**
- [ ] Quebrar StudioEditor em 5 componentes
- [ ] Integrar GAMA DS V3 tokens
- [ ] Implementar dark/light theme toggle
- [ ] Mobile responsive

**Phase 4: Testes + Deploy (1 semana)**
- [ ] Testes E2E (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Registrar em GAMA_MONITOR
- [ ] Deploy em Vercel

### Esforço Estimado
- **Desenvolvimento:** 120-160 horas (4-6 semanas, 1 dev)
- **QA/Testes:** 30-40 horas
- **Deploy/Docs:** 10-15 horas
- **Total:** 160-215 horas

### Resultado Esperado
- ✅ MVP pronto para 1-10 clientes reais
- ✅ Multi-user, multi-tenant
- ✅ 80%+ test coverage
- ✅ Integrado com GAMA DS V3
- ✅ API REST para futuras integrações

---

## 📎 Anexo: Decisões de Projeto Relevantes

**Sobre localStorage:** Adequado para MVP/demo, não para produção multi-user

**Sobre html2pdf:** Substituir por `@react-pdf/renderer` (mantido, 7k stars)

**Sobre precificação:** O modelo documentado é correto — só precisa ser código, não documento

**Sobre design:** Cores GAMA já estão integradas — estender para tipografia/spacing/componentes

---

**Status Final:** ✅ AUDITORIA CONCLUÍDA  
**Data:** 2026-05-15  
**Próximo Passo:** Iniciar Phase 1 (Backend + Precificação)
