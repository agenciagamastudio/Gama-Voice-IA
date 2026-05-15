# PROMPT FASE 2 — Configurações: Rate Card e Overhead

> **Pré-requisitos:** Fase 1 concluída. Novo schema aplicado, sistema rodando.

---

## Contexto

Schema novo está no ar. Agora vamos criar as **telas de configuração** que alimentam toda a inteligência do sistema: Rate Card (profissionais e suas hora-custo), Overhead (custos fixos da agência) e Configuração Geral (margem-alvo).

Sem essas telas, o sistema não tem como calcular preço floor. Por isso vêm antes das telas de orçamento.

## Sua Tarefa nesta Fase

### Ação 1 — Criar rota de configurações

Crie a estrutura de rotas:

```
app/configuracoes/
├── page.tsx                  → Hub central de configurações
├── profissionais/page.tsx    → CRUD de profissionais
├── overhead/page.tsx         → CRUD de overhead
└── rate-card/page.tsx        → Visualização da Rate Card calculada
```

Adicione um item "Configurações" no menu lateral (sidebar) do app, usando o componente de navegação existente.

### Ação 2 — Tela: CRUD de Profissionais

`app/configuracoes/profissionais/page.tsx`

**Funcionalidades:**
- Listar todos os profissionais ativos em uma tabela
- Colunas: Nome, Função, Tipo (interno/freelance), Hora-Custo, Capacidade/Mês, Ações
- Botão "+ Novo Profissional" abre modal/formulário
- Formulário com campos: nome, função, tipo (select), hora-custo (R$), capacidade-mês (horas)
- Edição inline ou via modal
- Desativar profissional (soft delete via campo `ativo`)

**Seed inicial** (faça um seed.ts ou script de inicialização que cadastre os 4 profissionais base da Gama):

```typescript
const profissionaisIniciais = [
  { nome: "Designer", funcao: "Design Gráfico", tipo: "freelance", horaCusto: 75.00, capacidadeMes: 120 },
  { nome: "Editor / Storymaker", funcao: "Edição de Vídeo", tipo: "freelance", horaCusto: 50.00, capacidadeMes: 120 },
  { nome: "Matheus", funcao: "Estratégia", tipo: "interno", horaCusto: 100.00, capacidadeMes: 120 },
  { nome: "Graça", funcao: "Gestão de Redes", tipo: "interno", horaCusto: 60.00, capacidadeMes: 120 },
]
```

### Ação 3 — Tela: CRUD de Overhead

`app/configuracoes/overhead/page.tsx`

**Funcionalidades:**
- Listar itens de overhead ativos
- Colunas: Nome, Categoria, Valor Mensal, Proporcional (%), Ações
- Botão "+ Novo Item" 
- Categorias: software | utilidades | ferramentas | outros
- Campo "proporcional" para itens compartilhados (ex: 0.33 = 1/3 da internet residencial)
- Total mensal calculado e exibido no topo

**Seed inicial:**
```typescript
const overheadInicial = [
  { nome: "Internet residencial (1/3)", categoria: "utilidades", valorMensal: 90.00, proporcional: 0.33 },
  { nome: "Energia residencial (1/3)", categoria: "utilidades", valorMensal: 300.00, proporcional: 0.33 },
  { nome: "Adobe Creative Cloud", categoria: "software", valorMensal: 165.00, proporcional: 1.00 },
  { nome: "Canva Pro", categoria: "software", valorMensal: 40.00, proporcional: 1.00 },
  { nome: "Claude Code", categoria: "ferramentas", valorMensal: 110.00, proporcional: 1.00 },
]
```

### Ação 4 — Tela: Rate Card Calculada

`app/configuracoes/rate-card/page.tsx`

Esta tela é **somente leitura** — mostra a Rate Card calculada automaticamente a partir dos dados de Profissionais e Overhead.

**Funcionalidades:**
- Card no topo mostrando:
  - Overhead Mensal Total: R$ XXX,XX (somatório dos itens × proporcionais)
  - Horas Produtivas Totais/Mês: somatório das capacidades dos profissionais ativos
  - Hora-Empresa: Overhead ÷ Horas Produtivas Totais
  - Margem-Alvo Atual: XX% (com botão para editar e salvar em ConfigAgencia)
  
- Tabela da Rate Card com colunas:
  - Função | Hora-Custo | Hora-Empresa | Margem % | Hora-Vendida
  
- Fórmula visível em tooltip ou nota de rodapé:
  `Hora-Vendida = (Hora-Custo + Hora-Empresa) × (1 + Margem-Alvo)`

- Botão "Recalcular" que força um refresh dos cálculos (caso o usuário tenha mudado algo)

### Ação 5 — Lib de cálculo

Crie `lib/pricing/rate-card.ts` com funções puras:

```typescript
export function calcularHoraEmpresa(
  overhead: OverheadItem[],
  profissionais: Profissional[]
): number

export function calcularRateCard(
  profissionais: Profissional[],
  horaEmpresa: number,
  margemAlvo: number
): RateCardLinha[]

// Tipo de retorno
type RateCardLinha = {
  profissionalId: string
  nome: string
  funcao: string
  horaCusto: number
  horaEmpresa: number
  margemValor: number
  horaVendida: number
}
```

Essas funções DEVEM ser puras (sem efeito colateral, sem acessar banco) — recebem dados e devolvem cálculo. Isso facilita testes e reuso na Fase 4.

### Ação 6 — Persistir ConfigAgencia

Crie um registro único em `ConfigAgencia` ao rodar o seed:
- `margemAlvo: 0.35` (35%)
- `horaEmpresaAtual: calculada do seed`
- `horasProdutivasTotal: calculada do seed`
- `overheadTotal: calculado do seed`

Crie endpoint `POST /api/config/recalcular` que recalcula esses valores quando profissionais ou overhead são alterados.

### Ação 7 — Reportar

Me mande:
1. Print da tela `/configuracoes/rate-card` com a Rate Card calculada
2. Confirmação de que os valores batem com a especificação v1:
   - Hora-Empresa esperada: R$ 5,45
   - Hora-Vendida do Designer: R$ 108,61
   - Hora-Vendida do Editor: R$ 74,86
   - Hora-Vendida do Matheus: R$ 142,36
   - Hora-Vendida da Graça: R$ 88,36
3. Qualquer divergência ou problema

## Regras Críticas

- ❌ **NÃO** toque nas telas de orçamento ainda (próximas fases)
- ❌ **NÃO** invente UI nova fora do GAMA Design System já aplicado
- ✅ Use os componentes base existentes em `components/ui/*`
- ✅ Mantenha dark mode e identidade visual
- ✅ Commit ao final: `git commit -m "Fase 2: telas de configuração e Rate Card"`

## Quando Terminar

Cole o relatório aqui. Vou validar visualmente e te liberar para Fase 3.
