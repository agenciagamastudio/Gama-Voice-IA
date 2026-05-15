# ✅ Tracker de Progresso — Reset Cirúrgico GAMA Orçamento

> Use este arquivo para acompanhar o progresso. Marque o checkbox quando completar cada fase.

---

## 📊 Status Geral

- **Início:** [data]
- **Fase atual:** Fase 0 — Backup e Preparação
- **Última atualização:** [data]

---

## ☐ Fase 0 — Backup e Preparação

- **Prompt:** `PROMPT_FASE_0_BACKUP.md`
- **Status:** ☐ Não iniciada / ☐ Em andamento / ☐ Concluída
- **Data conclusão:** ___
- **Observações:** ___

### Checklist:
- ☐ Branch `pre-reset-cirurgico-backup` criada
- ☐ Branch `reset-cirurgico-v1` criada e ativa
- ☐ Pasta `_legacy/` criada
- ☐ `INVENTARIO_PRESERVACAO.md` gerado
- ☐ Validei o inventário com o Claude (este chat)

---

## ☐ Fase 1 — Novo Schema do Banco

- **Prompt:** `PROMPT_FASE_1_SCHEMA.md`
- **Status:** ☐ Não iniciada / ☐ Em andamento / ☐ Concluída
- **Data conclusão:** ___
- **Observações:** ___

### Checklist:
- ☐ Tabela `Service` movida para legacy
- ☐ Novas tabelas criadas no schema.prisma
- ☐ Migration aplicada com sucesso
- ☐ `npm run dev` roda sem erro 500
- ☐ Commit `Fase 1: novo schema v1 aplicado`

---

## ☐ Fase 2 — Configurações (Rate Card + Overhead)

- **Prompt:** `PROMPT_FASE_2_CONFIG.md`
- **Status:** ☐ Não iniciada / ☐ Em andamento / ☐ Concluída
- **Data conclusão:** ___
- **Observações:** ___

### Checklist:
- ☐ CRUD de Profissionais funcionando
- ☐ CRUD de Overhead funcionando
- ☐ Rate Card calculada batendo com especificação:
  - ☐ Hora-Empresa = R$ 5,45
  - ☐ Designer = R$ 108,61
  - ☐ Editor = R$ 74,86
  - ☐ Matheus = R$ 142,36
  - ☐ Graça = R$ 88,36
- ☐ Commit `Fase 2: configuração e Rate Card`

---

## ☐ Fase 3 — Catálogo de Entregáveis

- **Prompt:** `PROMPT_FASE_3_CATALOGO.md`
- **Status:** ☐ Não iniciada / ☐ Em andamento / ☐ Concluída
- **Data conclusão:** ___
- **Observações:** ___

### Checklist:
- ☐ Seed de entregáveis aplicado (Post, Reels, Estratégia, Gestão, etc.)
- ☐ Preços floor batendo:
  - ☐ Post = R$ 36,20
  - ☐ Reels = R$ 18,72
  - ☐ Estratégia Mensal = R$ 284,72
  - ☐ Gestão Mensal = R$ 441,80
- ☐ Pré-visualização no formulário funcionando
- ☐ Commit `Fase 3: catálogo de entregáveis`

---

## ☐ Fase 4 — Motor de Cálculo

- **Prompt:** `PROMPT_FASE_4_MOTOR.md`
- **Status:** ☐ Não iniciada / ☐ Em andamento / ☐ Concluída
- **Data conclusão:** ___
- **Observações:** ___

### Checklist:
- ☐ `lib/pricing/floor.ts` criado
- ☐ `lib/pricing/sugestoes.ts` criado
- ☐ `lib/pricing/convergencia.ts` criado
- ☐ Endpoint `/api/orcamentos/calcular` funcional
- ☐ Página `/teste-motor` mostrando 3 sugestões
- ☐ Cenário "sem histórico" retorna multiplicador 1.5x
- ☐ Cálculo de Preço Floor para pacote padrão = R$ 1.165,82
- ☐ Commit `Fase 4: motor de cálculo`

---

## ☐ Fase 5 — Telas de Orçamento

- **Prompt:** `PROMPT_FASE_5_TELAS.md`
- **Status:** ☐ Não iniciada / ☐ Em andamento / ☐ Concluída
- **Data conclusão:** ___
- **Observações:** ___

### Checklist:
- ☐ Tela de criação de orçamento refatorada (Modo Construção + Aplicação)
- ☐ Tela de sugestão de preço com 3 cards + Sugestão Inteligente
- ☐ Tela de lista de orçamentos com novos campos
- ☐ Tela de detalhe mostrando snapshot da Rate Card
- ☐ Função "Salvar como Template" com nudge de 5 orçamentos
- ☐ Exportação PDF adaptada
- ☐ Fluxo completo testado: novo orçamento → sugestão → fechamento → PDF
- ☐ Commit `Fase 5: telas refatoradas`

---

## ☐ Fase 6 — Auditoria e Polimento

- **Prompt:** `PROMPT_FASE_6_AUDITORIA.md`
- **Status:** ☐ Não iniciada / ☐ Em andamento / ☐ Concluída
- **Data conclusão:** ___
- **Observações:** ___

### Checklist:
- ☐ Tela de Auditoria com filtros e métricas
- ☐ Gráfico de evolução da margem
- ☐ Alertas no Dashboard
- ☐ Lib de métricas de auditoria
- ☐ Checklist visual completo (dark mode, design, etc.)
- ☐ Checklist funcional (rotas, validações, loading states)
- ☐ README.md atualizado
- ☐ Tag git `v1.0.0` criada
- ☐ Página de teste interno removida
- ☐ Commit `Fase 6: auditoria e polimento — v1.0.0`

---

## 🎉 Conclusão

- **Data de entrega final:** ___
- **Status:** ☐ Entregue / ☐ Em produção

### Próximos passos pós-v1:

- [ ] Usar o sistema por 2-4 semanas para validação real
- [ ] Acumular 15-20 orçamentos fechados
- [ ] Coletar feedback de uso prático
- [ ] Decidir início do GAMA Diagnóstico v1
- [ ] Possível v1.1 com ajustes baseados no uso real

---

## 📝 Log de Problemas Encontrados

> Anote aqui qualquer bug, decisão difícil, ou momento "agora vai" que aconteceu durante a execução. Útil para trazer pra esta conversa quando precisar de ajuda.

### Fase 0
- ___

### Fase 1
- ___

### Fase 2
- ___

### Fase 3
- ___

### Fase 4
- ___

### Fase 5
- ___

### Fase 6
- ___
