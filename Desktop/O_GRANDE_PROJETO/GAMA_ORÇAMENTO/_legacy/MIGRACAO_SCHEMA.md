# Migração de Schema — Phase 1 ✅

**Data:** 2026-05-15  
**Status:** ✅ Schema v1 Criado (Awaiting Database Setup)

---

## O Que Foi Feito

### 1. Estrutura Prisma Criada
- ✅ Pasta `prisma/` criada
- ✅ `prisma/schema.prisma` — Schema v1 completo com 10 modelos
- ✅ `prisma/.gitignore` — Configuração padrão
- ✅ `.env` — Configuração de banco (placeholder)
- ✅ `.env.example` — Template de variáveis

### 2. Tabelas Novas (8 modelos ativos)
```
ConfigAgencia         — Parâmetros globais de precificação
Profissional          — Recursos humanos (sócios, freelancers)
OverheadItem          — Custos fixos mensais
EntregavelCatalogo    — Tipos de serviços (Post, Reels, etc)
Cliente               — Refatorado com tagContextoAtual
Template              — Templates reutilizáveis de orçamento
Orcamento             — Refatorado com valores normalizados
OrcamentoItem         — Refatorado: horasUnitarias ao invés de precoUnitario
OrcamentoVersion      — Histórico de versões
```

### 3. Tabela Legacy
- `Service_legacy` — Antiga tabela de serviços (priceMin/priceMax)
  - Mapeada para "Service" no banco (via `@@map`)
  - Marcada como deprecated (`@@deprecated`)
  - **NÃO será usada no novo modelo**
  - Mantida para rollback se necessário

---

## Mudanças Principais vs. Model Antigo

### Mudança 1: localStorage → PostgreSQL
**Antes:** Dados em localStorage (volatile, não persistente)  
**Depois:** Dados em PostgreSQL (durável, queryable, ACID)

### Mudança 2: Preço Fixo → Preço por Hora
**Antes:** `OrcamentoItem.precoUnitario` (fixo)  
**Depois:** `OrcamentoItem.horasUnitarias` + `horaVendidaAplicada` (calculado)

**Implicação:** Cálculo de preço agora é transparente = hora × horas × margem

### Mudança 3: Configuração Global
**Novo:** `ConfigAgencia` para parâmetros centralizados
- Margem-alvo global (%)
- Hora-empresa sugerida (R$/h)
- Ajustes de inflação/sazonalidade

### Mudança 4: Overhead Explícito
**Novo:** `OverheadItem` lista custos fixos da agência
- Salários, aluguel, software, etc
- Cálculo automático de overhead por orçamento

### Mudança 5: Profissionais e Capacidade
**Novo:** `Profissional` modelo com:
- Hora-custo real (para cálculo de margem)
- Capacidade mensal (h/mês)
- Associação com entregáveis

---

## Checklist de Reversão (se necessário)

Se precisar voltar atrás:

```bash
# Ver status da migração
npx prisma migrate status

# Reverter para commit anterior
git checkout pre-reset-cirurgico-backup

# Ou resetar banco (DELETE!)
npx prisma migrate reset --force

# Depois re-migrar a Fase 0
git checkout reset-cirurgico-v1
```

---

## Próximas Ações (Phase 2+)

- **Phase 2:** Configurar Supabase + criar migrations
- **Phase 3:** Implementar motor de precificação em TypeScript
- **Phase 4:** Criar catálogo com interface de admin
- **Phase 5:** Refatorar UI para usar novo schema
- **Phase 6:** QA completa + testes

---

## Notas Técnicas

### Índices e Performance
- Adicionados índices em `OrcamentoItem.orcamentoId` e `.entregavelId`
- `OrcamentoVersion.__unique([orcamentoId, numero])` previne duplicatas

### Relacionamentos
- `Cliente.orcamentos` — 1:N
- `Orcamento.itens` — 1:N
- `Orcamento.versoes` — 1:N (histórico)
- `Profissional.orcamentoItens` — 1:N (quem trabalhou)

### JSON Storage
- `Template.estrutura` — Armazenado como STRING (JSON serializado)
- `OrcamentoVersion.snapshot` — Snapshot completo de cada versão

---

## ⚠️ Conhecidos Blockers

1. **Não há PostgreSQL local setup**
   - Precisar setup local ou usar Supabase
   - DATABASE_URL em `.env` é placeholder

2. **Prisma Client não foi gerado**
   - Rodar `npx prisma generate` após setup de banco
   - Ou `npx prisma migrate dev` (cria + gera)

3. **localStorage data não foi migrada**
   - Dados antigos ficarão em localStorage
   - Será necessário script de migração em Phase 2

---

**Status:** ✅ Schema definido | ⏳ Awaiting DB setup | ❌ Migrations not yet applied

**Próximo:** Ir para Phase 2 (Configurar Supabase e Migrations)
