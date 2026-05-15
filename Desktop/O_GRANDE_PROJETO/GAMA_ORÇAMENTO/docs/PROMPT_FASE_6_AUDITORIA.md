# PROMPT FASE 6 — Modo Auditoria + Polimento Final

> **Pré-requisitos:** Fase 5 concluída. Telas de orçamento funcionando com motor v1.

---

## Contexto

Sistema funcional. Última fase do Reset Cirúrgico: criar o Modo Auditoria (que fecha o feedback loop do sistema) e fazer o polimento final antes de considerar o GAMA Orçamento v1 entregue.

## Sua Tarefa nesta Fase

### Ação 1 — Tela: Modo Auditoria

`app/orcamentos/auditoria/page.tsx`

**Funcionalidades principais:**

```
┌──────────────────────────────────────────────────────────────┐
│  📊 AUDITORIA DE ORÇAMENTOS                                  │
│                                                              │
│  Filtros: [Período ▼] [Template ▼] [Cliente ▼] [Tag ▼]      │
│                                                              │
│  ─────────────────────────────────                           │
│  RESUMO EXECUTIVO                                            │
│  ─────────────────────────────────                           │
│  Total fechado: R$ 38.450,00                                 │
│  Orçamentos: 23 (média R$ 1.671)                             │
│  Margem média: 42,3% (alvo: 35%)                             │
│  Multiplicador médio: 1,62x                                  │
│                                                              │
│  ─────────────────────────────────                           │
│  POR TEMPLATE                                                │
│  ─────────────────────────────────                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │ Pacote Padrão          12 usos                      │      │
│  │ Margem média: 45%      Multiplicador: 1,65x        │      │
│  │ ⚠️  Margem decrescente (últimos 3 meses)           │      │
│  └────────────────────────────────────────────────────┘      │
│                                                              │
│  [Mais templates...]                                         │
│                                                              │
│  ─────────────────────────────────                           │
│  TABELA DE ORÇAMENTOS                                        │
│  ─────────────────────────────────                           │
│  Data | Cliente | Template | Floor | Praticado | Mult | Margem│
│  ...                                                         │
│                                                              │
│  [Exportar CSV]                                              │
└──────────────────────────────────────────────────────────────┘
```

**Implementação:**

1. **Cards de resumo no topo** com métricas agregadas
2. **Agrupamento por template** mostrando: usos, margem média histórica, multiplicador médio, tendência (crescente/estável/decrescente baseado nos últimos 3 meses)
3. **Tabela completa** com todos os orçamentos filtrados, ordenável por qualquer coluna
4. **Alertas automáticos** acima da tabela:
   - "🟡 Template X com margem decrescente — considere revisão"
   - "🔴 Orçamento Y fechado abaixo do floor"
   - "🟢 Tag Premium com margem 18% acima da Padrão — segmentação está funcionando"
5. **Exportação CSV** com todos os dados filtrados

### Ação 2 — Gráfico de Evolução

Adicione um gráfico de linha na tela de auditoria mostrando a evolução da margem média ao longo do tempo (eixo X = mês, eixo Y = margem %).

Use uma biblioteca leve como Recharts (já vem com Next.js). NÃO adicione dependências pesadas só pra isso.

### Ação 3 — Alertas no Dashboard

Volte ao Dashboard inicial (`app/page.tsx` ou `app/dashboard/page.tsx`) e adicione uma seção "Alertas":

- Templates que precisam de revisão (90 dias ou 10 usos)
- Orçamentos próximos do fechamento sem proposta enviada
- Mudanças significativas na Rate Card que afetam orçamentos em rascunho

### Ação 4 — Lib: cálculos de auditoria

Crie `lib/auditoria/metricas.ts` com funções puras:

```typescript
export function calcularMargemReal(orcamento: OrcamentoCompleto): number
export function calcularMultiplicador(orcamento: OrcamentoCompleto): number
export function detectarTendenciaMargem(orcamentos: OrcamentoCompleto[]): "crescente" | "estavel" | "decrescente"
export function detectarTemplatesParaRevisao(templates: Template[]): Template[]
```

### Ação 5 — Revisão da experiência geral

Faça uma passagem por todo o sistema verificando:

**Checklist visual:**
- [ ] Dark mode aplicado em TODAS as telas
- [ ] Cor primária #88CE11 usada em CTAs e elementos de destaque
- [ ] Tipografia Poppins aplicada (ou consistente em todo o app)
- [ ] Sem ícones quebrados ou imagens faltando
- [ ] Sem warnings no console do navegador

**Checklist funcional:**
- [ ] Todas as rotas abrem sem erro 500
- [ ] Formulários têm validação básica (campos obrigatórios)
- [ ] Loading states em ações assíncronas
- [ ] Mensagens de erro úteis quando algo falha
- [ ] Empty states bonitos quando não há dados (ex: "Nenhum orçamento ainda — clique em + para criar o primeiro")

**Checklist de dados:**
- [ ] Cálculos batem com a especificação v1
- [ ] Snapshot da Rate Card sendo salvo em orçamentos
- [ ] Soft delete funciona (campos `ativo`)
- [ ] Datas no formato brasileiro (DD/MM/YYYY)
- [ ] Valores monetários no formato R$ X.XXX,XX

### Ação 6 — Documentação mínima

Crie `README.md` na raiz do projeto com:

```markdown
# GAMA Orçamento v1

Sistema de precificação inteligente da agência GAMA Studio.

## Stack
- Next.js 14+ (App Router)
- TypeScript
- Prisma + SQLite
- Tailwind CSS
- GAMA Design System

## Como rodar
\`\`\`bash
npm install
npx prisma migrate dev
npm run dev
\`\`\`

## Estrutura
- `app/` — rotas e páginas
- `components/` — componentes reutilizáveis
- `lib/pricing/` — motor de cálculo
- `lib/auditoria/` — métricas e análises
- `prisma/` — schema e migrations
- `_legacy/` — código antigo (não usar)

## Documentação
- Especificação completa: `GAMA_Orcamento_Especificacao_v1.docx`
- Kit de execução: `KIT_EXECUCAO_RESET_CIRURGICO.md`

## Versão
v1.0.0 — Maio 2026
```

### Ação 7 — Limpeza final

1. **Remover** a página de teste interna `app/teste-motor/page.tsx` (era só para debug da Fase 4)
2. **Arquivar** a pasta `_legacy/` em um zip e mover para fora do projeto (ou deixar, decisão do Matheus)
3. **Atualizar** `package.json` com versão `1.0.0`
4. **Tag git**: `git tag -a v1.0.0 -m "GAMA Orçamento v1 — Reset Cirúrgico concluído"`

### Ação 8 — Relatório final

Me mande:

1. **Print do Dashboard** com alertas
2. **Print da tela de Auditoria** com pelo menos 1 orçamento mock fechado pra mostrar o gráfico
3. **Lista de checkboxes** marcados/não-marcados da Ação 5
4. **Caminho do README.md** criado
5. **Confirmação da tag v1.0.0**

E uma **avaliação honesta**:
- O que ficou melhor do que você esperava?
- O que ainda parece "ok mas não ótimo"?
- O que você recomenda como próximas evoluções (v1.1, v1.2)?

## Regras Críticas

- ✅ Esta é a fase de "fechamento" — qualidade > velocidade
- ✅ Não introduza features novas além das listadas
- ✅ Foque em estabilidade e polimento
- ✅ Commit ao final: `git commit -m "Fase 6: auditoria e polimento — v1.0.0"`

## Quando Terminar

Cole aqui o relatório final. Vou revisar e a gente decide juntos o que vem depois (provavelmente: começar o GAMA Diagnóstico ou usar o sistema em produção por algumas semanas antes).

🎉 **Conquista:** ao terminar essa fase, você tem o GAMA Orçamento v1 entregue, alinhado com a especificação, e operando como sistema profissional de precificação da Gama Studio.
