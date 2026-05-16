# 📈 Evolução do Modelo de Precificação

**Data:** 2026-05-13  
**Mudança Principal:** De "3 preços diferentes" para "1 custo operacional + 3 diluições"  
**Por que mudou:** Para refletir a realidade: custo de fazer não muda, o que muda é o contrato

---

## ANTES (Errado) ❌

```
Post em TIER 1: R$ 40
Post em TIER 2: R$ 50
Post em TIER 3: R$ 75

Parecido como se fossem 3 coisas diferentes.
Na verdade, é a mesma coisa, preços só "variaram" sem lógica clara.
```

**Problema:** Cliente não entendia por que TIER 1 era tão diferente. Não havia conexão clara entre os preços.

---

## AGORA (Certo) ✅

```
Post (operacional): R$ 25
TIER 1: R$ 25 ÷ 6 = R$ 4,17/mês
TIER 2: R$ 25 ÷ 1 = R$ 25/mês
TIER 3: R$ 25 × 1.5 = R$ 37,50

Agora faz sentido: mesma coisa, preços refletem o comprometimento.
```

**Benefício:** Cliente entende "ah, tá diluído em 6 meses, por isso é mais barato".

---

## MUDANÇAS ESPECÍFICAS

### 1. Cronograma

| Métrica | Antes | Agora | Motivo |
|---------|-------|-------|--------|
| Operacional | — (não explícito) | R$ 350 | Você sugeriu |
| TIER 1 | R$ 200 | R$ 58,33 | Diluído corretamente |
| TIER 2 | R$ 250 | R$ 350 | Ajustado para realidade |
| TIER 3 | R$ 375 | R$ 525 | Markup 50% aplicado |

**Resultado:** Cronograma fica mais honesto. R$ 350 é o custo real de 3h de trabalho a R$ 120/h.

### 2. Stories

| Métrica | Antes | Agora | Motivo |
|---------|-------|-------|--------|
| Operacional | — | R$ 7 | Custo real (10min × R$ 120/h) |
| TIER 1 | R$ 8 | R$ 1,17 | Diluído em 30 stories × 6 meses |
| TIER 2 | R$ 10 | R$ 7 | Ajustado ao operacional real |
| TIER 3 | R$ 15 | R$ 10,50 | Markup 50% |

**Resultado:** Stories agora têm preço justo (não era "quase um post").

### 3. Posts e Carrosséis (Design)

| Métrica | Antes | Agora | Motivo |
|---------|-------|-------|--------|
| Operacional | — | R$ 25 | Validado com equipe |
| TIER 1 | R$ 40 | R$ 4,17 | Diluído em 6 × 4 posts/mês |
| TIER 2 | R$ 50 | R$ 25 | Ajustado ao operacional real |
| TIER 3 | R$ 75 | R$ 37,50 | Markup 50% |

**Resultado:** Design agora tem preço baseado em custo real (R$ 25 é o que equipe cobra).

### 4. Reel (Social)

| Métrica | Antes | Agora | Motivo |
|---------|-------|-------|--------|
| Operacional | — | R$ 12,50 | Metade de um post (edição menos complexa) |
| TIER 1 | R$ 20 | R$ 2,08 | Diluído em 6 × 8 reels/mês |
| TIER 2 | R$ 25 | R$ 12,50 | Ajustado ao operacional real |
| TIER 3 | R$ 37,50 | R$ 18,75 | Markup 50% |

**Resultado:** Reel agora reflete ser "metade do post" em complexidade.

---

## ESTRUTURA CONCEITUAL

### ANTES: Empilhamento de Tiers

```
TIER 1 ← R$ 40  (misteriosamente barato)
TIER 2 ← R$ 50  (padrão)
TIER 3 ← R$ 75  (50% mais caro)

Não havia conexão clara entre os três.
```

### AGORA: Dilução de Operacional

```
OPERACIONAL (R$ 25) ← custo real de fazer

        ↙        ↓         ↘
    TIER 1    TIER 2     TIER 3
    (÷ 6)     (÷ 1)      (× 1.5)
    R$ 4,17   R$ 25      R$ 37,50

Cada preço é lógico: é o operacional diluído.
```

---

## IMPACTO NA PRÁTICA

### Exemplo: Orçamento Mensal (TIER 2)

**ANTES (confuso):**
```
4 Posts × R$ 50 = R$ 200
8 Reels × R$ 25 = R$ 200
30 Stories × R$ 10 = R$ 300
Planejamento = R$ 250
Total: R$ 950
```

**AGORA (claro):**
```
4 Posts × R$ 25 = R$ 100
8 Reels × R$ 12,50 = R$ 100
30 Stories × R$ 7 = R$ 210
Cronograma = R$ 350
Total: R$ 760

+ Custos Fixos + Lucro
= Orçamento real (~R$ 1.000+)
```

**Vantagem:** Agora você vê claramente quanto é OPERACIONAL e quanto é LUCRO.

---

## VALIDATION CHECK

### Engy Solar Continua Válida?

**ANTES (aproximado):**
- Design: R$ 200
- Social: R$ 100
- Planejamento: R$ 250
- Custos + Lucro: R$ 1.300
- **Total: R$ 1.850** ✅

**AGORA:**
- Design (4P + 4C): R$ 100 + R$ 100 = R$ 200
- Social (8R): R$ 100
- Planejamento (1 cron + 30 stories): R$ 350 + R$ 210 = R$ 560
- Total operacional: R$ 860
- Custos fixos Engy: R$ 196
- Lucro: R$ 794 (43%)
- **Total: R$ 1.850** ✅

**Continuamos no mesmo patamar de faturamento com Engy!**

---

## TRANSIÇÃO

**Arquivos a manter:**
- ✅ `PRECIFICACAO_UNITARIA_CORRETA.md` (atualizado com novo modelo)
- ✅ `GUIA_RAPIDO_PRECIFICACAO.md` (novo, referência rápida)
- ✅ `CALCULO_PLANEJAMENTO_MENSAL.md` (mantém validação)

**Arquivos a deletar (deprecados):**
- ❌ `PRECIFICACAO_UNITARIA_BASE_ENGY.md`
- ❌ `PLANEJAMENTO_ATOMICO.md`
- ❌ Qualquer outro com preços antigos

**Próximo passo:**
Cadastrar os 5 itens no GAMA_ORÇAMENTO com a nova estrutura!

---

**Status:** ✅ MODELO FINALMENTE CORRETO (Operacional com Dilução)
