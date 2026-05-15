# PROMPT FASE 5 — Refatoração das Telas de Orçamento

> **Pré-requisitos:** Fase 4 concluída. Motor de cálculo funcionando e validado na página /teste-motor.

---

## Contexto

Agora vamos colocar o motor de cálculo dentro das telas de orçamento reais. As telas atuais têm boa UI, então preservamos a estrutura visual e trocamos a lógica interna.

**Princípio desta fase:** mantenha a estética atual (dark mode, GAMA Design System, fluxos visuais que o Matheus gosta), mas substitua os campos antigos (preço fixo) pelos novos (horas × hora-vendida).

## Sua Tarefa nesta Fase

### Ação 1 — Inventariar telas atuais

Liste todas as telas relacionadas a orçamento que existem hoje. Esperado:

```
app/orcamentos/page.tsx          → Lista de orçamentos
app/orcamentos/novo/page.tsx     → Criação
app/orcamentos/[id]/page.tsx     → Detalhe/edição
```

E os componentes:
```
components/orcamento/*
```

Antes de modificar, **me mostre print/screenshot do estado atual de cada tela** para eu validar o que será preservado visualmente.

### Ação 2 — Refatorar: Tela de Criação de Orçamento

`app/orcamentos/novo/page.tsx`

**Estrutura desejada (mantendo UI atual quando possível):**

```
┌────────────────────────────────────────────────────────────┐
│  NOVO ORÇAMENTO                                            │
│                                                            │
│  [Modo Construção] [Usar Template]  ← Toggle de modo       │
│                                                            │
│  📌 Cliente: [seleção ou novo]                             │
│  🏷️ Tag de Contexto: [Premium] [Padrão] [Estratégico] [Indicação]
│                                                            │
│  ────────────────────────────────────                      │
│  ENTREGÁVEIS                                               │
│  ────────────────────────────────────                      │
│                                                            │
│  [+ Adicionar Entregável]                                  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Post Estático      [- 8 +]  Designer  R$ 36,20      │   │
│  │ Subtotal: R$ 289,62                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Reels              [- 8 +]  Editor    R$ 18,72      │   │
│  │ Subtotal: R$ 149,76                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  [+ Adicionar Mais]                                        │
│                                                            │
│  ────────────────────────────────────                      │
│  💰 PREÇO FLOOR: R$ 1.165,82                               │
│  ────────────────────────────────────                      │
│                                                            │
│  [Calcular Sugestões de Preço]                             │
└────────────────────────────────────────────────────────────┘
```

**Modo Construção** (padrão ao abrir):
- Botão "+ Adicionar Entregável" abre dropdown/modal com lista do catálogo
- Cada entregável adicionado vira um card com: nome, quantidade (input numérico), profissional responsável (auto), preço floor unitário, subtotal
- Preço Floor total atualiza em tempo real conforme adiciona/remove itens
- Quando o usuário clica "Calcular Sugestões de Preço", chama o endpoint da Fase 4 e mostra a próxima tela

**Modo Usar Template:**
- Carrega lista de templates ativos
- Ao selecionar, preenche os entregáveis automaticamente
- Permite ajustar quantidades

### Ação 3 — Refatorar: Tela de Sugestão de Preço

Pode ser uma nova rota `app/orcamentos/novo/sugestao/page.tsx` ou modal/step da mesma tela.

**Layout (seguindo o mockup da especificação v1, seção 5.4):**

```
┌────────────────────────────────────────────────────────────┐
│  💰 PRECIFICAÇÃO DO ORÇAMENTO                              │
│                                                            │
│  Preço Floor: R$ 1.165,82                                  │
│  ─────────────────────────────────                         │
│                                                            │
│  📊 SUGESTÕES DE PREÇO:                                    │
│                                                            │
│  ┌──────────────────────────────────────────────┐          │
│  │ 📈 Média Histórica          R$ 1.850         │          │
│  │ 7 orçamentos fechados                        │          │
│  └──────────────────────────────────────────────┘          │
│                                                            │
│  ┌──────────────────────────────────────────────┐          │
│  │ 🔄 Multiplicador (1.59x)    R$ 1.853         │          │
│  │ Mantém margem histórica                      │          │
│  └──────────────────────────────────────────────┘          │
│                                                            │
│  ┌──────────────────────────────────────────────┐          │
│  │ 🎯 Faixa: 🔵 Padrão         R$ 1.850         │          │
│  │ Média de 5 clientes Padrão                   │          │
│  └──────────────────────────────────────────────┘          │
│                                                            │
│  ⭐ SUGESTÃO INTELIGENTE: R$ 1.850                          │
│  ✅ Forte sinal — as 3 lentes convergem                    │
│                                                            │
│  ─────────────────────────────────                         │
│  💼 Preço Praticado: [ R$ 1.850,00 ]                       │
│                                                            │
│  💚 Margem: R$ 684,18 (+58,7% sobre o floor)               │
│                                                            │
│  [Salvar como Rascunho]  [Gerar Proposta]                  │
└────────────────────────────────────────────────────────────┘
```

**Comportamentos:**
- Cards das 3 sugestões são clicáveis — clique copia o valor para o campo "Preço Praticado"
- A Sugestão Inteligente é destacada visualmente (border verde primary, badge "RECOMENDADO")
- Campo "Preço Praticado" é editável manualmente — usuário pode digitar valor diferente
- Margem se atualiza em tempo real conforme digita
- **Alerta vermelho** se Preço Praticado < Preço Floor: "⚠️ Você está cobrando abaixo do floor. Margem negativa: R$ XX,XX"
- "Salvar como Rascunho" persiste em DB com status "rascunho"
- "Gerar Proposta" salva com status "enviado" e leva à tela de exportação PDF

### Ação 4 — Refatorar: Tela de Lista de Orçamentos

`app/orcamentos/page.tsx`

**Mudanças necessárias:**
- Adicionar colunas: Preço Floor, Preço Praticado, Multiplicador, Tag de Contexto
- Filtros: status, tag, período, cliente
- Indicador visual:
  - 🟢 Verde se margem ≥ alvo (35% acima do floor)
  - 🟡 Amarelo se margem entre 0-35%
  - 🔴 Vermelho se preço praticado abaixo do floor
- Manter o resto da UI

### Ação 5 — Refatorar: Tela de Detalhe do Orçamento

`app/orcamentos/[id]/page.tsx`

**Mudanças necessárias:**
- Mostrar o snapshot da Rate Card no momento da criação (campo `rateCardSnapshot` em JSON)
- Mostrar os itens com horas, hora-vendida aplicada, subtotal
- Mostrar Floor vs Praticado lado a lado
- Botão "Duplicar" (para criar novo orçamento baseado neste)
- Botão "Gerar PDF" (usa a infra existente, só ajusta os campos exibidos)

### Ação 6 — Função "Salvar como Template"

No final de qualquer orçamento, botão "Salvar como Template".

**Lógica:**
1. Verificar quantos orçamentos similares já existem
2. Se < 5, mostrar **nudge** (não bloqueio): "Você já fez X orçamentos parecidos com este. Recomendo esperar até pelo menos 5 antes de salvar como template. Mesmo assim, deseja continuar?"
3. Se confirmar, salvar em tabela `Template` com a estrutura (itens + quantidades)
4. Template aparece na lista do Modo Aplicação na próxima vez

### Ação 7 — Adaptar exportação PDF

Provavelmente a exportação atual usa campos como "preço unitário" e "quantidade × preço". Adapte para usar a nova estrutura:

- Listar itens com: Nome, Quantidade, Subtotal
- NÃO mostrar horas ou hora-vendida no PDF do cliente (informação interna)
- Mostrar total final = Preço Praticado
- Manter layout visual existente

### Ação 8 — Validar e reportar

Cenário de teste:
1. Criar orçamento novo no Modo Construção
2. Adicionar 8 Posts + 8 Reels + 1 Estratégia + 1 Gestão
3. Selecionar tag "Padrão"
4. Clicar "Calcular Sugestões"
5. Confirmar que Preço Floor = R$ 1.165,82 (ou próximo)
6. Confirmar que Sugestão Inteligente aparece (com convergência "sem_dados" porque é o primeiro orçamento)
7. Digitar R$ 1.850 em Preço Praticado
8. Salvar como Enviado
9. Gerar PDF e validar visual

Me mande:
1. Prints de TODAS as telas refatoradas (criação, sugestão, lista, detalhe)
2. Print do PDF gerado
3. Confirmação de que o fluxo completo funciona sem erros

## Regras Críticas

- ❌ **NÃO** mexa nas configurações (já feitas na Fase 2 e 3)
- ❌ **NÃO** refaça a UI do zero — preserve o que já existe e troque a lógica
- ✅ Mantenha dark mode e identidade GAMA
- ✅ Cada tela deve continuar abrindo sem erro
- ✅ Commit ao final: `git commit -m "Fase 5: telas de orçamento refatoradas com motor v1"`

## Quando Terminar

Cole aqui os prints e o relatório. Vou validar e liberar para Fase 6 (Auditoria + Polimento Final).
