# CLAUDE.md — GAMA ORÇAMENTO

Este arquivo é lido automaticamente em toda sessão dentro deste projeto.
Contém contexto específico, decisões travadas e status atual.

---

## Projeto

- **Nome:** GAMA Orçamento
- **Purpose:** Gerador de orçamentos customizáveis para GAMA Studio (lojistas, freelancers, agências)
- **Type:** SaaS + Frontend
- **Owner:** Matheus (GAMA Studio)
- **Repository:** `/Desktop/O_GRANDE_PROJETO/GAMA_ORÇAMENTO/`

---


## 🚪 Seção 0 · Governança AIOS

**Status:** ✅ ATIVO (Implementado 2026-05-20)
**Modo:** STANDARD
**Estrutura:** `.claude/governance/` com CONSTITUICAO-AIOS.md + PIPELINE-STORY-DRIVEN.md

#

## Decisões Arquiteturais TRAVADAS (Não Revisitar)

| Decisão | Valor | Por Quê |
|---------|-------|---------|
| **Banco de dados** | SQLite local | Início, sem backend, fácil deploy local |
| **ORM** | Prisma | TypeScript-first, migrações automáticas, tipo-safe |
| **Framework** | Next.js 14 | App Router, SSR/SSG, TypeScript nativo |
| **Styling** | Tailwind CSS | Utility-first, prototipagem rápida, GAMA V3 tokens |
| **Port** | 3004 | Padrão para projetos GAMA locais |
| **Delete Strategy** | Soft delete via `ativo: false` | Recuperação de dados, audit trail |
| **Snapshot Rate Card** | Imutável no orçamento | Rastreabilidade — preço que tinha quando foi gerado |

---

## Fases do Projeto

| Fase | Status | Descrição | Validação |
|------|--------|-----------|-----------|
| **0** | ✅ COMPLETO | Estrutura base, Prisma schema, modelo Rate Card | — |
| **1** | ✅ COMPLETO | CRUD Orçamentos, formulário básico, listagem | Unit tests ✅ |
| **2** | ✅ COMPLETO | Entregáveis dinâmicos, cálculo de preço, seleção múltipla | Integration tests ✅ |
| **3** | ✅ COMPLETO | Exportação PDF com formatação, assinatura, impressão | Visual validation ✅ |
| **4** | ✅ COMPLETO | Histórico de versões, rastreamento de mudanças, snapshots | Audit log ✅ |
| **5** | ✅ COMPLETO | Refatorar UI + Design System (CSS Tailwind v4 + dark mode) | Visual validation ✅ |
| **6** | 🟡 LIBERADA | QA, Testes, Deploy, Auditoria Final | Em andamento |

---

## Rate Card — Valores de Referência (TRAVADO)

| Pessoa | Valor/Hora | Cálculo |
|--------|-----------|---------|
| **Floor (Padrão)** | R$ 1.165,82/projeto | Mínimo obrigatório por orçamento |
| **Hora-Empresa** | R$ 5,45/h | Dev infra, ops, suporte |
| **Designer** | R$ 108,61/h | UI/UX design |
| **Editor** | R$ 74,86/h | Conteúdo, copy |
| **Matheus** | R$ 142,36/h | Gestor, consultoria |
| **Graça** | R$ 88,36/h | Apoio, admin |

**Markup aplicado:** Overhead fixo mensal (~28%) distribuído automaticamente em cada serviço.

Estes valores estão gravados em: `lib/pricing/rate-card.ts` (imutável, versionado).

---

## Convenções de Código

### Cálculos de Preço
- **Local:** `src/lib/pricing/*` — Funções puras, SEM efeitos colaterais
- **Invariante:** Cálculos nunca modificam estado direto
- **Teste:** Todo cálculo tem testes unitários
- **Snapshot:** Valor calculado é salvo NO MOMENTO do orçamento (nunca recalculado)

### Banco de Dados
- **Soft delete:** Usar `ativo: false` em vez de `DELETE FROM`
- **Snapshots:** Tabela `rate_card_snapshot` guarda preços no momento
- **Migrations:** Prisma automático, versionado no git
- **Relacionamentos:** NEVER DELETE — soft delete sempre

### Naming
- **Componentes:** PascalCase (`CalculadoraPreco.tsx`)
- **Funções:** camelCase (`calcularPreco()`)
- **Arquivos:** kebab-case (`rate-card.ts`)
- **Interfaces/Types:** PascalCase (`CalculoConfig`, `OrçamentoItem`)

---

## Problemas Conhecidos (RESOLVIDOS)

| Problema | Status | Resolução | Data |
|----------|--------|-----------|------|
| CSS não compilava (Tailwind classes faltando) | ✅ CORRIGIDO | Adicionado `@import "tailwindcss";` no topo de globals.css | 2026-05-16 |
| Histórico datas "Invalid Date" em folders | ✅ CORRIGIDO | UTC parsing + pt-BR format | 2026-05-14 |

---

## O Que NÃO Fazer

❌ **NÃO REVISITE ESTAS DECISÕES sem avisar:**
- Trocar banco (SQLite está travado)
- Modificar estrutura de soft delete (audit trail precisa disso)
- Alterar Rate Card sem atualizar versionamento

❌ **NÃO INSTALE dependências** sem confirmar ("Vou adicionar X. Tá certo?")

❌ **NÃO DELETE** nada do banco — sempre soft delete

❌ **NÃO MARQUE FASE CONCLUÍDA** sem validação visual in-browser (você viu rodando?)

---

## Próximas Ações Concretas

### Phase 5 — CSS Final (CONCLUÍDO ✅)

**Status:** ✅ COMPLETO  
**O Que Foi Feito:** 
- Diagnosticado problema: CSS não compilava porque `globals.css` faltava diretiva `@import "tailwindcss";`
- Adicionada diretiva no topo de `src/app/globals.css`
- Reiniciado dev server (necessário para recompilação Tailwind v4)
- CSS agora tem 35.8 KB (antes 1.9 KB) com todas as classes Tailwind presentes
- Validação visual: Dashboard, Auditoria (gráficos), Performance templates — **TODOS OK**

**Validado em:** 2026-05-16 (todas 3 telas)

### Phase 6 — QA, Testes, Deploy, Auditoria Final (ATUAL)

**Status:** 🟡 LIBERADA  
**Escopo:** 
1. Testes unitários (pricing calculations)
2. Testes de integração (API routes)
3. Validação de responsividade (mobile, tablet, desktop)
4. Auditoria final (performance, acessibilidade, segurança)
5. Geração de relatório de qualidade
6. Deploy checklist (se aplicável)

**Timeline:** ~3-5 dias (conforme descobertas)

---

## Documentos Relacionados

- **Especificação:** [./docs/PROJECT-BRIEF.md](./docs/PROJECT-BRIEF.md)
- **Histórico:** [./CHANGELOG.md](./CHANGELOG.md)
- **Último resumo:** [./SESSAO_RESUMO.md](./SESSAO_RESUMO.md) (se existir)

---

## Comandos do Projeto

```bash
npm run dev          # Desenvolvimento local (porta 3004)
npm test             # Rodar testes (Jest)
npm run lint         # Lint + format
npm run typecheck    # TypeScript check
npm run build        # Build produção
npm run migrate      # Prisma migrations (dev)
npm run db:studio    # Abrir Prisma Studio (GUI do SQLite)
```

---

**Last Updated:** 2026-05-16 (Fase 5 ✅ Concluída, Fase 6 🟡 Liberada)  
**Contact:** Matheus (theu02427875@gmail.com)  
**Stack:** SQLite + Prisma + Next.js 14 + TypeScript + Tailwind v4  
**Port:** 3004

