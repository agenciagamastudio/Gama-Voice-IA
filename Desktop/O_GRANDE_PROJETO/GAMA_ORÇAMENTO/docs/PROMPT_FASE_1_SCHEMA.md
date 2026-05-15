# PROMPT FASE 1 — Novo Schema do Banco

> **Pré-requisitos:** Fase 0 concluída. Branch `reset-cirurgico-v1` ativa. Pasta `_legacy/` criada com inventário.

---

## Contexto

Hoje começamos a reescrita real. O foco desta fase é **substituir o schema atual do Prisma** pelo schema novo que reflete a especificação v1, sem quebrar nada que está rodando.

**Princípio fundamental desta fase:** o sistema atual deve continuar rodando até o final da Fase 1. Mesmo que algumas funcionalidades fiquem "em construção", o `npm run dev` deve abrir o app sem erro 500.

## Sua Tarefa nesta Fase

Execute em ordem:

### Ação 1 — Inspecionar o schema atual

Abra `prisma/schema.prisma` e me mostre o conteúdo COMPLETO atual. Não modifique ainda.

### Ação 2 — Propor o novo schema

Baseado na especificação v1, o novo schema precisa ter as seguintes tabelas (use os nomes exatos):

- `Profissional` — recursos humanos (sócios e freelancers)
- `OverheadItem` — custos fixos mensais da agência
- `ConfigAgencia` — parâmetros globais (margem-alvo, hora-empresa calculada)
- `EntregavelCatalogo` — tipos de entregável (Post, Reels, etc) com tempo padrão
- `Cliente` — cadastro de clientes (refatorar o existente, adicionar campo `tagContextoAtual`)
- `Template` — estruturas de orçamento reutilizáveis
- `Orcamento` — orçamentos gerados (refatorar o existente)
- `OrcamentoItem` — itens de orçamento (refatorar o existente, mudar de `precoUnitario` para `horasUnitarias` + `horaVendidaAplicada`)

**Antes de tocar no arquivo**, me mostre:
1. O schema atual completo (Ação 1)
2. Um plano em bullets de QUAIS tabelas você vai criar, modificar e mover para legacy
3. **Aguarde minha aprovação** antes de aplicar mudanças

### Ação 3 — Aplicar o novo schema

Depois da minha aprovação:

1. **Mova a tabela `Service` atual** para `_legacy/`:
   - Renomeie-a no schema.prisma para `Service_legacy` (ou comente-a com `// LEGACY - não usar`)
   - Documente em `_legacy/MIGRACAO_SCHEMA.md` o que foi feito

2. **Adicione as novas tabelas** no `schema.prisma` seguindo este modelo (campos detalhados na especificação v1, seção 6):

```prisma
model Profissional {
  id              String   @id @default(cuid())
  nome            String
  funcao          String
  tipo            String   // "interno" | "freelance"
  horaCusto       Decimal  @db.Decimal(8, 2)
  capacidadeMes   Int      @default(160)
  ativo           Boolean  @default(true)
  criadoEm        DateTime @default(now())
  atualizadoEm    DateTime @updatedAt
  
  // Relações que serão criadas
  entregaveis     EntregavelCatalogo[]
  orcamentoItens  OrcamentoItem[]
}

// (e assim por diante para as outras tabelas — siga a especificação v1)
```

3. **Refatore as tabelas existentes** (`Cliente`, `Orcamento`, `OrcamentoItem`, `Template`) seguindo a especificação v1, mantendo os IDs antigos para não quebrar referências.

4. **Crie a migration** com nome descritivo:
```bash
npx prisma migrate dev --name reset_cirurgico_schema_v1
```

5. **Atualize o Prisma Client**:
```bash
npx prisma generate
```

### Ação 4 — Validar que nada quebrou

1. Rode `npm run dev` e abra o app no navegador
2. Navegue pelas telas que existem hoje
3. **Esperado:** algumas telas podem mostrar erros ou dados em branco (porque a tabela Service foi movida), mas o app NÃO deve quebrar inteiro com erro 500
4. Se quebrar inteiro: pause, me chame antes de tentar consertar

### Ação 5 — Documentar e reportar

Atualize `_legacy/MIGRACAO_SCHEMA.md` com:
- O que foi mudado (lista resumida)
- O que pode quebrar nas próximas fases (telas que dependiam de Service, etc.)
- Comandos para reverter caso necessário (`git checkout pre-reset-cirurgico-backup`)

Me reporte:
1. Status da migração (`prisma migrate status`)
2. Print do `npm run dev` mostrando que o app subiu
3. Lista de telas que **abrem sem erro** vs. telas que **mostram erro/em branco** após a mudança
4. Próximo passo sugerido (deve ser "aguardar liberação para Fase 2")

## Regras Críticas

- ❌ **NÃO** delete a tabela `Service` — apenas mova/renomeie para legacy
- ❌ **NÃO** apague migrations antigas
- ❌ **NÃO** comece a Fase 2 sem minha autorização
- ✅ Mostre o plano ANTES de executar
- ✅ Faça commit ao final desta fase: `git commit -m "Fase 1: novo schema v1 aplicado"`

## Quando Terminar

Cole o relatório aqui e aguarde. Vou validar e te liberar para Fase 2.
