# PROMPT FASE 4 — Motor de Cálculo (Floor + 3 Sugestões)

> **Pré-requisitos:** Fase 3 concluída. Catálogo de entregáveis com preços floor calculados.

---

## Contexto

Esta é a fase mais densa do Reset Cirúrgico. Aqui criamos o **cérebro do sistema**: a lógica que calcula Preço Floor a partir dos itens do orçamento, e as 3 Sugestões de Preço (Média Histórica, Multiplicador Observado, Faixa Segmentada) com análise de convergência.

A Fase 5 (telas de orçamento) vai apenas consumir o que essa fase entrega. Por isso esta fase precisa ser robusta e bem testada.

## Sua Tarefa nesta Fase

### Ação 1 — Lib: cálculo do Preço Floor

Crie `lib/pricing/floor.ts`:

```typescript
type ItemOrcamento = {
  entregavelId: string
  quantidade: number
  horasUnitariasCustom?: number  // se null, usa o padrão do entregável
}

type ItemCalculado = {
  entregavelId: string
  entregavelNome: string
  profissionalNome: string
  quantidade: number
  horasUnitarias: number
  horasTotais: number
  horaVendidaAplicada: number
  subtotal: number
}

export function calcularPrecoFloor(
  itens: ItemOrcamento[],
  entregaveis: EntregavelCatalogoComProfissional[],
  rateCard: RateCardLinha[]
): {
  itensCalculados: ItemCalculado[]
  precoFloor: number
}
```

A função deve:
1. Para cada item, buscar o entregável correspondente
2. Buscar a hora-vendida do profissional responsável no rateCard
3. Calcular horasUnitarias (custom ou padrão), horasTotais, subtotal
4. Somar os subtotais para o preço floor total
5. Retornar a estrutura completa

### Ação 2 — Lib: 3 Sugestões de Preço

Crie `lib/pricing/sugestoes.ts`:

```typescript
type Sugestao = {
  tipo: "media_historica" | "multiplicador" | "faixa_segmentada"
  valor: number | null  // null se não houver histórico suficiente
  confianca: "alta" | "media" | "baixa" | "sem_dados"
  detalhes: string  // texto explicativo
  numAmostras: number
}

type SugestaoInteligente = {
  valorRecomendado: number
  justificativa: string
  convergencia: "forte" | "media" | "divergente" | "sem_dados"
}

export async function calcularSugestoes(params: {
  precoFloor: number
  templateId: string | null
  tagContexto: "premium" | "padrao" | "estrategico" | "indicacao"
  prisma: PrismaClient
}): Promise<{
  mediaHistorica: Sugestao
  multiplicador: Sugestao
  faixaSegmentada: Sugestao
  sugestaoInteligente: SugestaoInteligente
}>
```

**Lógica das 3 sugestões:**

**1. Média Histórica:**
- Buscar orçamentos fechados com mesmo template_id (ou sem template, agrupados por estrutura similar)
- `valor = AVG(preco_praticado) WHERE template_id = X AND status = 'fechado'`
- Confiança: "alta" se ≥5 amostras, "media" se 3-4, "baixa" se 1-2, "sem_dados" se 0

**2. Multiplicador Observado:**
- Para cada orçamento fechado, calcular `multiplicador = preco_praticado / preco_floor_naquele_momento`
- Calcular a média desses multiplicadores
- `valor = preco_floor_atual × multiplicador_medio`
- Mesma escala de confiança

**3. Faixa Segmentada:**
- Filtrar orçamentos fechados onde `tag_contexto = tag_atual`
- `valor = AVG(preco_praticado) WHERE tag_contexto = X AND template_id = Y`
- Mesma escala de confiança

### Ação 3 — Lógica de Convergência

Implemente em `lib/pricing/convergencia.ts`:

```typescript
export function analisarConvergencia(sugestoes: {
  mediaHistorica: Sugestao
  multiplicador: Sugestao
  faixaSegmentada: Sugestao
}): SugestaoInteligente
```

**Regras:**

1. **Sem dados suficientes** (todas com confiança "sem_dados" ou "baixa"):
   - `valorRecomendado = precoFloor × 1.5` (multiplicador conservador)
   - `convergencia: "sem_dados"`
   - `justificativa: "Não há histórico suficiente. Recomendação baseada em multiplicador conservador de 1,5x sobre o floor. Considere consultar a tag de contexto do cliente."`

2. **Convergência Forte** (as 3 sugestões válidas dentro de ±5%):
   - `valorRecomendado = média das 3`
   - `convergencia: "forte"`
   - `justificativa: "Forte sinal — as 3 lentes convergem dentro de ±5%."`

3. **Divergência por Custo** (multiplicador destoa para CIMA da média histórica em ≥10%):
   - `valorRecomendado = sugestao.multiplicador.valor`
   - `convergencia: "divergente"`
   - `justificativa: "⚠️ Custos da Gama parecem ter crescido desde os últimos orçamentos. Multiplicador observado sugere valor mais alto para manter a margem histórica."`

4. **Cliente Atípico** (faixa segmentada destoa das outras duas em ≥10%):
   - `valorRecomendado = sugestao.faixaSegmentada.valor`
   - `convergencia: "divergente"`
   - `justificativa: "💡 Este perfil de cliente (tag X) costuma pagar valor diferente da média geral. Considere a faixa correspondente."`

5. **Convergência Média** (variação entre 5% e 10%):
   - `valorRecomendado = média das 3`
   - `convergencia: "media"`
   - `justificativa: "Sinal moderado — as 3 lentes apontam em direção similar com pequena variação."`

### Ação 4 — Endpoint da API

Crie `app/api/orcamentos/calcular/route.ts`:

```typescript
// POST /api/orcamentos/calcular
// Body: { itens, templateId?, tagContexto }
// Retorna: { itensCalculados, precoFloor, sugestoes, sugestaoInteligente }
```

Este endpoint será consumido pela tela de orçamento na Fase 5.

### Ação 5 — Testes manuais

Antes de me reportar, faça este teste manual via Postman/Insomnia/curl:

**Cenário 1 — Sem histórico (sistema novo):**
```json
POST /api/orcamentos/calcular
{
  "itens": [
    { "entregavelNome": "Post Estático", "quantidade": 8 },
    { "entregavelNome": "Reels", "quantidade": 8 },
    { "entregavelNome": "Estratégia Mensal", "quantidade": 1 },
    { "entregavelNome": "Gestão de Rede Social (mensal)", "quantidade": 1 }
  ],
  "tagContexto": "padrao"
}
```

**Resposta esperada:**
- precoFloor ≈ R$ 1.165,82 (8×36,20 + 8×18,72 + 284,72 + 441,80)
- sugestoes com confiança "sem_dados"
- sugestaoInteligente.valorRecomendado ≈ R$ 1.748,73 (1,5x do floor)
- convergencia: "sem_dados"

Me mande:
1. Output completo do teste acima
2. Confirmação de que o cálculo bate com a especificação
3. Qualquer divergência encontrada

### Ação 6 — Página de teste interna

Crie uma página simples em `app/teste-motor/page.tsx` (rota oculta, só para validação) com:

- Form simples para selecionar entregáveis e quantidades
- Botão "Calcular"
- Display dos 3 cards de sugestão (Média Histórica, Multiplicador, Faixa Segmentada)
- Display da Sugestão Inteligente destacada

Esta página serve só pra você validar visualmente que o motor funciona antes de integrá-lo nas telas de orçamento reais na Fase 5. Pode ser feia, sem polimento — é debug interno.

## Regras Críticas

- ❌ **NÃO** modifique as telas de orçamento existentes ainda
- ❌ **NÃO** confie em testes mentais — rode o cenário 1 de verdade
- ✅ Funções de cálculo DEVEM ser puras (sem efeito colateral)
- ✅ Use Decimal/BigNumber para evitar erros de ponto flutuante (R$ 0,01)
- ✅ Commit ao final: `git commit -m "Fase 4: motor de cálculo com 3 sugestões e convergência"`

## Quando Terminar

Cole aqui:
1. Output do cenário de teste 1
2. Print da página `/teste-motor` funcionando
3. Confirmação da Sugestão Inteligente com o multiplicador 1,5x

Vou validar e liberar para Fase 5 (refatoração das telas).
