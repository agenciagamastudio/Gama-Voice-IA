# PROMPT FASE 3 — Catálogo de Entregáveis

> **Pré-requisitos:** Fase 2 concluída. Rate Card calculada e visível.

---

## Contexto

Com a Rate Card pronta, agora vamos criar o **catálogo de entregáveis** — os tipos de serviço que a Gama oferece (Post, Reels, Estratégia, Gestão, etc.), cada um com tempo padrão associado e profissional responsável.

Esse catálogo é o que permite, na próxima fase, montar um orçamento como "8 Posts + 8 Reels + 2h Estratégia + 5h Gestão" e ver o preço floor sendo calculado automaticamente.

## Sua Tarefa nesta Fase

### Ação 1 — Tela CRUD: Catálogo de Entregáveis

`app/configuracoes/entregaveis/page.tsx` (adicionar item no menu)

**Funcionalidades:**
- Listar todos os entregáveis ativos
- Colunas: Nome, Categoria, Profissional Responsável, Tempo Padrão (minutos), Unidade, Ações
- Botão "+ Novo Entregável"
- Formulário com campos:
  - Nome (ex: "Post Estático", "Reels", "Carrossel", "Story", "Estratégia Mensal")
  - Categoria (select): producao | estrategia | gestao | extras
  - Profissional Responsável (select com profissionais ativos da Fase 2)
  - Tempo Padrão em **minutos** (importante: usar minutos, não horas, conforme você pediu na conversa)
  - Unidade (select): unidade | hora | mensal
  - Ativo (toggle)

**Seed inicial:**
```typescript
const entregaveisIniciais = [
  // Produção
  { nome: "Post Estático", categoria: "producao", profissionalFuncao: "Design Gráfico", tempoMinutos: 20, unidade: "unidade" },
  { nome: "Carrossel (3-5 slides)", categoria: "producao", profissionalFuncao: "Design Gráfico", tempoMinutos: 45, unidade: "unidade" },
  { nome: "Reels", categoria: "producao", profissionalFuncao: "Edição de Vídeo", tempoMinutos: 15, unidade: "unidade" },
  { nome: "Story", categoria: "producao", profissionalFuncao: "Design Gráfico", tempoMinutos: 10, unidade: "unidade" },
  
  // Estratégia
  { nome: "Estratégia Mensal", categoria: "estrategia", profissionalFuncao: "Estratégia", tempoMinutos: 120, unidade: "mensal" }, // 2h
  { nome: "Planejamento de Campanha", categoria: "estrategia", profissionalFuncao: "Estratégia", tempoMinutos: 180, unidade: "unidade" }, // 3h
  
  // Gestão
  { nome: "Gestão de Rede Social (mensal)", categoria: "gestao", profissionalFuncao: "Gestão de Redes", tempoMinutos: 300, unidade: "mensal" }, // 5h
  { nome: "Resposta a Comentários/DMs", categoria: "gestao", profissionalFuncao: "Gestão de Redes", tempoMinutos: 60, unidade: "mensal" }, // 1h adicional
]
```

### Ação 2 — Componente de pré-visualização do preço

No formulário de criação/edição de entregável, mostre um cálculo em tempo real:

```
┌─────────────────────────────────────────┐
│ Pré-visualização do Preço Floor:        │
│                                         │
│ Tempo: 20 minutos (0,33h)               │
│ Profissional: Designer                  │
│ Hora-Vendida: R$ 108,61                 │
│                                         │
│ Preço Floor por unidade: R$ 36,20       │
└─────────────────────────────────────────┘
```

Fórmula:
```
horas = tempoMinutos / 60
precoFloor = horas × horaVendidaProfissional
```

### Ação 3 — Lib de conversão

Crie `lib/pricing/entregaveis.ts`:

```typescript
export function minutosParaHoras(minutos: number): number {
  return minutos / 60
}

export function calcularPrecoFloorEntregavel(
  entregavel: EntregavelCatalogo,
  horaVendidaProfissional: number
): number {
  const horas = minutosParaHoras(entregavel.tempoMinutos)
  return horas * horaVendidaProfissional
}
```

### Ação 4 — Endpoint de listagem

Crie `app/api/entregaveis/route.ts` com:

- `GET /api/entregaveis` — retorna lista de entregáveis ativos com cálculo de preço floor já feito (para uso na Fase 4)
- `POST /api/entregaveis` — cria novo
- `PUT /api/entregaveis/[id]` — edita
- `DELETE /api/entregaveis/[id]` — soft delete (set ativo = false)

O endpoint GET deve retornar:

```typescript
{
  entregaveis: [
    {
      id: "...",
      nome: "Post Estático",
      categoria: "producao",
      profissional: { id, nome, funcao, horaVendida },
      tempoMinutos: 20,
      unidade: "unidade",
      precoFloorUnitario: 36.20  // já calculado
    },
    // ...
  ]
}
```

### Ação 5 — Validar e reportar

Me mande:
1. Print da tela `/configuracoes/entregaveis` com a lista completa após o seed
2. Confirmação dos preços calculados (baseado na Rate Card da Fase 2):
   - Post Estático (20min × Designer R$108,61/h) = R$ 36,20
   - Reels (15min × Editor R$74,86/h) = R$ 18,72
   - Estratégia Mensal (120min × Matheus R$142,36/h) = R$ 284,72
   - Gestão Mensal (300min × Graça R$88,36/h) = R$ 441,80
3. Qualquer divergência

## Regras Críticas

- ❌ **NÃO** comece a refatorar telas de orçamento ainda
- ❌ **NÃO** mexa nos seeds de Profissional e Overhead (já feitos na Fase 2)
- ✅ Mantenha a mesma estética das telas da Fase 2
- ✅ Commit ao final: `git commit -m "Fase 3: catálogo de entregáveis com seed inicial"`

## Quando Terminar

Cole o relatório aqui. Vou validar e te liberar para Fase 4 (o motor de cálculo, parte mais densa).
