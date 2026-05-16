# Inventário de Preservação — GAMA Orçamento Reset Cirúrgico v1

**Data:** 2026-05-15  
**Auditoria:** AUDITORIA_GAMA_ORCAMENTO_2026-05-15.md

---

## Seção A — Preservar Integralmente

Estes arquivos/pastas funcionam bem no modelo novo e devem ser preservados **exatamente como estão**:

### Configuração do Projeto
- `package.json` — Dependências (Next.js 15.0.3, React 18.3.1, TypeScript 5.6.3)
- `tsconfig.json` — TypeScript strict mode
- `next.config.js` — Configuração Next.js
- `.env` (placeholder) — Variáveis de ambiente

### Design System e Temas
- `src/app/globals.css` — Variáveis CSS (cores GAMA, dark theme, scrollbar)
- Imports de fontes system (-apple-system, Segoe UI)
- Print media styles (@media print)

### Layout e Navegação
- `src/app/layout.tsx` — Layout root (estrutura geral)
- `src/components/` — Componentes de UI existentes (BudgetTemplate, OrcamentoDoc, DateSelectorModal)

### Tipos e Interfaces
- `src/types/orcamento.ts` — Interfaces TypeScript (112 linhas, bem estruturadas)
  - Orcamento, OrcamentoItem, Empresa, Cliente
  - CatalogItem, CatalogSnapshot, OrcamentoVersion
  - PricingConfig

### Utilitários
- `src/lib/utils.ts` — Formatadores (fmt, maskPhone, maskCNPJ, maskCPF, etc)
- Masks de documento (CPF/CNPJ automático)

### Exportação de PDF
- `src/components/BudgetTemplate.tsx` — Template de impressão
- `src/components/OrcamentoDoc.tsx` — Documento formatado
- Print styling em globals.css

---

## Seção B — Preservar Estrutura, Refatorar Conteúdo

Estas rotas/componentes têm estrutura boa mas precisam de refatoração de conteúdo:

### Telas de Orçamento
- `src/app/page.tsx` (304 linhas) — Listagem principal
  - ✅ MANTER: grouping por data, busca, filtro por status
  - 🔧 REFATORAR: lógica de cálculo de total (usar nova engine)
  - 🔧 REFATORAR: chamadas localStorage (trocar por Supabase)

- `src/app/novo/page.tsx` (30 linhas) — Criar novo
  - ✅ MANTER: estrutura de wrapper
  - 🔧 REFATORAR: salvamento (localStorage → API)

- `src/app/[id]/editar/page.tsx` — Editor
  - ✅ MANTER: rota e layout
  - 🔧 REFATORAR: integridade de dados (localStorage → API)

### Telas de Catálogo
- `src/app/catalogo/page.tsx` — Listagem de itens
  - ✅ MANTER: CRUD interface
  - 🔧 REFATORAR: campos tipo_precificacao (adaptar para nova engine)

- `src/app/catalogo/novo/page.tsx` — Novo item
  - ✅ MANTER: estrutura
  - 🔧 REFATORAR: validação de preço (novo engine)

### Dashboard/Estatísticas
- `src/app/page.tsx` — Status counters (Aprovado/Pendente/Rejeitado/Rascunho)
  - ✅ MANTER: contadores
  - 🔧 REFATORAR: totalValue (usar novo calcular)

### Telas Auxiliares (Preservar)
- `src/app/[id]/preview/page.tsx` — Visualização de print ✅ MANTER
- `src/app/[id]/historico/page.tsx` — Versões antigas ✅ MANTER
- `src/app/[id]/comparar/page.tsx` — Side-by-side ✅ MANTER
- `src/app/[id]/versao/[versao]/page.tsx` — Restaurar versão ✅ MANTER
- `src/app/empresa/page.tsx` — Dados da empresa ✅ MANTER
- `src/app/configuracoes/precificacao/page.tsx` — Config de preços (refatorar schema)
- `src/app/lixeira/page.tsx` — Soft delete UI ✅ MANTER
- `src/app/exportar/page.tsx` — Exportação ✅ MANTER

---

## Seção C — Mover para `_legacy/` na Fase 1

Estes arquivos representam o modelo antigo e serão movidos para `_legacy/` **sem deletar**:

### Lógica de Storage Obsoleta (localStorage)
- `src/lib/storage.ts` (100 linhas) — Será substituído por Supabase client
  - ⚠️ MOVER: getAll(), getById(), save(), remove()
  - ⚠️ MOVER: soft delete logic (getTrash, restoreFromTrash)
  - ⚠️ MOVER: duplicate() function
  - ⚠️ MOVER: Empresa functions (getEmpresa, saveEmpresa)

### Componentes Monolíticos (Será quebrado)
- `src/components/StudioEditor.tsx` (687 linhas) — Editor principal
  - ⚠️ MOVER PARCIAL: estado interno será refatorado em 5 componentes menores
  - Será desconstruído em: PricingCalculator, ItemEditor, ClientForm, etc

### Integração GAMA Design System (Desacoplada)
- `src/app/globals.css` (47 linhas) — CSS custom (não tokens DS)
  - ⚠️ PREPARAR: substituição por GAMA DS V3 tokens
  - Cores: será refatorado com `--gama-primary`, `--gama-bg`, etc

### Lógica de Precificação (Documentação, não código)
- Documentação em `FORMULA_MESTRE_120H.md` + 14 outros `.md` (~45 KB)
  - ⚠️ CODIFICAR: Em Fase 3, migrar documentação para funções TypeScript
  - Origem: `FORMULA_MESTRE_120H.md`, `FRAMEWORK_PERSONALIZADO_GAMA.md`, etc

---

## Sumário Quantitativo

| Categoria | Arquivos | Status |
|-----------|----------|--------|
| Preservar Integralmente | 12 | ✅ Mantém |
| Preservar Estrutura | 15 | 🔧 Refatorar conteúdo |
| Mover para _legacy/ | 4 | ⚠️ Documentar transição |
| **TOTAL** | **~31** | |

---

## Anotações Especiais

### Surpresas Encontradas
1. **Não há Prisma schema** — Sistema é localStorage, não DB. Precisamos criar schema from scratch.
2. **Não há API REST** — Tudo é client-side. Será necessário criar `/api/` folder completo.
3. **html2pdf desatualizado** — Dependência de 2019. Considerar `@react-pdf/renderer` em Fase 5.
4. **Sem testes** — 0% coverage. Fase 4 (QA) adicionará testes E2E com Playwright.
5. **Design desacoplado** — Colors GAMA estão em CSS, mas tipografia/spacing são custom.

### Arquivos que Não Existem (Esperado)
- ❌ Prisma schema (será criado em Fase 1)
- ❌ API routes (será criado em Fase 2)
- ❌ Supabase client (será criado em Fase 2)
- ❌ GAMA DS V3 imports (será integrado em Fase 5)

---

**Inventário finalizado:** 2026-05-15  
**Próxima ação:** Ler este arquivo antes de começar Fase 1
