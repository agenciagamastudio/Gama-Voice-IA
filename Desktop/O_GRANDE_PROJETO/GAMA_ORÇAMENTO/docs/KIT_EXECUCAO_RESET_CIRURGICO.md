# 🚀 GAMA Orçamento — Kit de Execução do Reset Cirúrgico

> **Como usar:** este é o documento mestre. Te diz O QUE preservar, EM QUE ORDEM executar, e te aponta para os PROMPTS prontos que você vai mandar pro Orion fase por fase.

---

## 📋 Resumo da Estratégia

**Decisão:** Reset Cirúrgico — preservar UI/Design/PDF que estão bons, reescrever toda a camada de cálculo e modelo de dados a partir da especificação v1.

**Tempo estimado:** 3 a 5 semanas com sessões focadas no Orion (vs. 9-12 semanas que o Orion estimou para refatoração tradicional).

**Princípio operacional:** o sistema atual continua rodando enquanto você reconstrói o motor por baixo. No final, você troca o motor antigo pelo novo num "switch único".

---

## 🛡️ PARTE 1 — Lista de Arquivos a PRESERVAR

Esses arquivos NÃO devem ser deletados nem modificados drasticamente. Eles representam o trabalho de 1 dia que tem valor real e independente da lógica de precificação.

### Categoria A — Preservar Integralmente

```
✅ Toda a configuração do projeto:
   - package.json
   - tsconfig.json
   - next.config.js
   - tailwind.config.js
   - .env.local (variáveis de ambiente)
   - prisma/schema.prisma (vamos AUMENTAR, não substituir)

✅ Identidade visual e design system:
   - styles/globals.css (variáveis CSS do GAMA Design System)
   - components/ui/* (todos os componentes base: Button, Input, Card, etc)
   - Qualquer arquivo de tema/cores/tipografia

✅ Layout e navegação:
   - app/layout.tsx (estrutura raiz)
   - app/(dashboard)/layout.tsx (se existir)
   - components/sidebar/* ou components/navigation/*

✅ Cadastro de cliente (com pequenos ajustes futuros):
   - app/clientes/page.tsx
   - app/clientes/[id]/page.tsx
   - app/clientes/novo/page.tsx
   - components/clientes/*

✅ Exportação de PDF (estrutura geral):
   - lib/pdf/* ou utils/pdf/*
   - components/proposta/* (template visual da proposta)
   - Qualquer arquivo relacionado a geração de documento
```

### Categoria B — Preservar Estrutura, Refatorar Conteúdo

Esses arquivos têm boa estrutura visual, mas a lógica interna precisa mudar:

```
⚠️ Telas de orçamento (preservar UI, trocar lógica):
   - app/orcamentos/page.tsx (lista)
   - app/orcamentos/novo/page.tsx (criação)
   - app/orcamentos/[id]/page.tsx (detalhe)
   - components/orcamento/* (componentes visuais)

⚠️ Telas de templates:
   - app/templates/page.tsx
   - components/template/*

⚠️ Dashboard:
   - app/page.tsx ou app/dashboard/page.tsx
   - components/dashboard/*
```

### Categoria C — Arquivar e Recomeçar

Esses arquivos contêm a lógica antiga de "preço fixo por entregável" que conflita com o novo modelo. Não deletar — mover para `_legacy/` para referência:

```
❌ Mover para _legacy/ (não deletar ainda):
   - Tabela Service no schema.prisma (renomear para Service_legacy temporariamente)
   - lib/pricing/* ou utils/pricing/* (qualquer cálculo de preço)
   - components/service/* (cadastro de serviços com priceMin/priceMax)
   - Qualquer arquivo que faça quantidade × preço_unitário
```

---

## 🔢 PARTE 2 — Ordem de Execução

A reescrita acontece em **6 fases**. Cada fase tem um prompt pronto pra você colar no Orion. Não pule fases — a ordem importa porque cada fase depende da anterior.

### Visão Geral das Fases

| Fase | Foco | Prompt | Tempo Estimado |
|------|------|--------|----------------|
| 0 | Preparação e Backup | `PROMPT_FASE_0_BACKUP.md` | 30min |
| 1 | Novo Schema do Banco | `PROMPT_FASE_1_SCHEMA.md` | 2-3 dias |
| 2 | Configurações (Rate Card, Overhead) | `PROMPT_FASE_2_CONFIG.md` | 3-4 dias |
| 3 | Catálogo de Entregáveis + Profissionais | `PROMPT_FASE_3_CATALOGO.md` | 2-3 dias |
| 4 | Motor de Cálculo (Floor + 3 Sugestões) | `PROMPT_FASE_4_MOTOR.md` | 4-5 dias |
| 5 | Refatoração das Telas de Orçamento | `PROMPT_FASE_5_TELAS.md` | 5-7 dias |
| 6 | Modo Auditoria + Polimento | `PROMPT_FASE_6_AUDITORIA.md` | 3-4 dias |

**Total estimado:** 3-4 semanas de trabalho real do Orion (você pode pausar entre fases sem problema).

---

## 📜 PARTE 3 — Princípios para a Conversa com o Orion

Algumas regras que valem para TODAS as fases:

### Como dar contexto ao Orion no início de cada fase

Antes de colar o prompt da fase, sempre faça isso:

1. **Carregue a especificação v1** no contexto do Claude Code:
   - Use o arquivo `GAMA_Orcamento_Especificacao_v1.docx` (ou versão `.md` que vou gerar a seguir)
   - Diga: *"Antes de começar, leia a especificação v1 que está em [caminho] e me confirme em uma frase que entendeu o escopo da fase atual."*

2. **Reforce que é Reset Cirúrgico:**
   - *"Estamos fazendo Reset Cirúrgico: preservar UI/PDF/Design System, reescrever lógica de cálculo. Não delete arquivos sem me perguntar."*

3. **Peça plano antes de executar:**
   - *"Antes de tocar em qualquer arquivo, me mostre o plano em bullet points. Só execute depois que eu aprovar."*

### Quando o Orion travar ou fizer besteira

Você disse que vai me avisar quando algo der errado. Aqui está como me ajudar a te ajudar:

**Quando você vier aqui:**

- **Cole o erro/output completo** do Orion (mesmo que pareça grande)
- **Diga em qual fase você está** (Fase 1? Fase 4?)
- **Diga o que você esperava que acontecesse** vs. o que aconteceu

**O que NÃO precisa fazer:**

- Não precisa traduzir o erro pra mim — cola o que o Orion mostrou
- Não precisa explicar muito o contexto se for problema técnico simples
- Não tenta arrumar sozinho coisas que você não entende — vem aqui primeiro

### Quando algo é "trivial"

Coisas como "abre o backend", "reinicia o servidor", "instala uma dependência que faltou" — execute direto, sem me consultar. Você sabe fazer isso e eu não preciso opinar.

---

## 📍 PARTE 4 — Checkpoint entre Fases

Ao final de CADA fase, faça este checkpoint comigo antes de partir pra próxima:

1. **Cole aqui o que o Orion entregou** (resumo das mudanças)
2. **Confirma:** "rodei localmente, abre sem erro" ou "tem erro X"
3. **Espera minha luz verde** pra começar a próxima fase

Isso garante que a gente não acumule problemas pra depois.

---

## 🎯 PARTE 5 — Como saber se o Reset Cirúrgico está funcionando

A cada fase, o sistema deveria continuar rodando. Mesmo que algumas telas mostrem "Em construção", o sistema NÃO deve quebrar inteiro.

**Sinal verde:** depois de cada fase, você consegue rodar `npm run dev` e abrir o app no navegador sem erro 500.

**Sinal vermelho:** você roda `npm run dev` e a tela inicial mostra erro. Pare imediatamente e venha me chamar.

---

## 🗂️ Arquivos que você tem em mãos

Depois desta sessão, você vai ter:

1. ✅ `GAMA_Orcamento_Especificacao_v1.docx` (já tem) — referência principal
2. ✅ `GAMA_Diagnostico_Especificacao_v1.docx` (já tem) — para a Fase 7 futura
3. ✅ `KIT_EXECUCAO_RESET_CIRURGICO.md` (este arquivo) — roteiro mestre
4. 📝 `PROMPT_FASE_0_BACKUP.md` — preparação
5. 📝 `PROMPT_FASE_1_SCHEMA.md` — schema do banco
6. 📝 `PROMPT_FASE_2_CONFIG.md` — Rate Card e overhead
7. 📝 `PROMPT_FASE_3_CATALOGO.md` — entregáveis e profissionais
8. 📝 `PROMPT_FASE_4_MOTOR.md` — motor de cálculo
9. 📝 `PROMPT_FASE_5_TELAS.md` — refatoração das telas
10. 📝 `PROMPT_FASE_6_AUDITORIA.md` — modo auditoria + polimento

---

**Bora começar.** Próximo passo: abrir o Claude Code, posicionar-se em `C:\Users\Usuario\Desktop\O_GRANDE_PROJETO\GAMA_ORÇAMENTO` e colar o conteúdo de `PROMPT_FASE_0_BACKUP.md`. ☕
