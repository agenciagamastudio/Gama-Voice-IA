# PROMPT FASE 0 — Backup e Preparação

> Cole este prompt no Claude Code/Orion, dentro da pasta `C:\Users\Usuario\Desktop\O_GRANDE_PROJETO\GAMA_ORÇAMENTO`.

---

## Contexto

Estou iniciando o **Reset Cirúrgico** do GAMA Orçamento — uma reescrita controlada que preserva UI/PDF/Design System e reescreve toda a lógica de cálculo a partir da especificação v1 que foi criada em conversa estratégica.

Você (Orion) já fez a auditoria do sistema atual e ela está em `AUDITORIA_GAMA_ORCAMENTO_2026-05-15.md` na raiz do projeto.

## Sua Tarefa nesta Fase

**Fase 0 = Preparar o terreno antes de tocar em qualquer código de produção.**

Execute estas 5 ações, em ordem:

### Ação 1 — Confirmar entendimento
Leia (apenas leia, não modifique):
- A auditoria que você gerou: `AUDITORIA_GAMA_ORCAMENTO_2026-05-15.md`
- O documento de especificação v1 (se eu te enviar `GAMA_Orcamento_Especificacao_v1.docx` ou `.md`)

Me confirme em **3 bullets curtos**:
- Qual a diferença fundamental entre o sistema atual e a especificação v1
- O que vai ser preservado
- O que vai ser reescrito

### Ação 2 — Backup do estado atual
Crie uma branch git chamada `pre-reset-cirurgico-backup` com o código atual EXATAMENTE como está hoje. Comando esperado:

```bash
git checkout -b pre-reset-cirurgico-backup
git add .
git commit -m "Snapshot pre-reset cirurgico — estado funcional v0"
git push origin pre-reset-cirurgico-backup
```

Se não houver repositório git inicializado, inicialize agora e faça o primeiro commit.

Depois, volte para a branch principal:

```bash
git checkout main  # ou master, dependendo do nome
git checkout -b reset-cirurgico-v1
```

### Ação 3 — Criar pasta `_legacy/`
Crie uma pasta `_legacy/` na raiz do projeto. Esta pasta vai receber arquivos do modelo antigo que não devem ser deletados (para referência), mas também não devem ser usados no novo modelo.

Adicione `_legacy/` ao `.gitignore`? **NÃO.** Queremos versionar o legacy também.

Crie um arquivo `_legacy/README.md` com este conteúdo:

```markdown
# Pasta Legacy

Esta pasta contém código do modelo antigo do GAMA Orçamento (preço fixo por entregável).
NÃO usar este código no sistema novo. Mantido apenas para referência durante a transição.

Pode ser deletado completamente após validação do novo sistema.
```

### Ação 4 — Inventário dos arquivos a preservar
Sem mover nada, gere um arquivo `_legacy/INVENTARIO_PRESERVACAO.md` que lista, em 3 seções:

**Seção A — Preservar Integralmente:**
- Configuração do projeto (package.json, tsconfig, next.config, tailwind, prisma, .env)
- Design System (globals.css, components/ui/*, temas)
- Layout e navegação (app/layout.tsx, sidebar, navigation)
- Cadastro de cliente (todas as telas e componentes de cliente)
- Exportação de PDF (toda a infra de geração de documento)

**Seção B — Preservar Estrutura, Refatorar Conteúdo:**
- Telas de orçamento (lista, criação, detalhe)
- Telas de templates
- Dashboard

**Seção C — Mover para _legacy/ na Fase 1:**
- Tabela `Service` no schema atual
- Qualquer `lib/pricing/*` ou `utils/pricing/*` (cálculo de preço antigo)
- Componentes de cadastro de serviços com priceMin/priceMax

Para cada item, **liste os caminhos exatos dos arquivos** que você encontrar no projeto atual. Não invente caminhos — só liste o que realmente existe.

### Ação 5 — Reportar
Ao final, me devolva uma mensagem curta com:

1. Branch atual em que você está agora (`git branch --show-current`)
2. Caminho da pasta `_legacy/` criada
3. Caminho do `INVENTARIO_PRESERVACAO.md`
4. Status do backup (commitado, pushed?)
5. **Qualquer surpresa** que encontrou ao inventariar (arquivos que não esperava, dependências estranhas, etc.)

## Regras Críticas

- ❌ **NÃO** modifique nenhum arquivo de produção nesta fase
- ❌ **NÃO** delete nada
- ❌ **NÃO** comece a próxima fase sem minha autorização
- ✅ Trabalhe apenas em criar a pasta `_legacy/` e dois arquivos dentro dela
- ✅ Confirme o backup git antes de qualquer outra coisa

## Quando Terminar

Pare e aguarde. Vou revisar o que você fez e te liberar para Fase 1.
