# Auditoria e Polimento Final — Fase 6

## 📊 Página de Auditoria

Localização: `/orcamentos/auditoria`

### Funcionalidades

#### 1. **Resumo Executivo (4 Cards)**
- **Total Fechado**: Soma de preços práticados para orçamentos aprovados
- **Média por Orçamento**: Valor médio dos orçamentos fechados
- **Margem Média**: Percentual médio de lucro (meta: 35%)
- **Multiplicador Médio**: Quantas vezes o preço floor é cobrado (meta: 1.5x - 1.7x)

#### 2. **Gráfico de Evolução (Últimos 5 Meses)**
- Mostra tendência de margem ao longo do tempo
- Curva esperada: estável ou crescente
- Queda contínua = sinal para revisar estratégia de preços
- Componente: **Recharts LineChart**

#### 3. **Alertas Automáticos**
Sistema de alerta em 3 níveis:

| Tipo | Cor | Significado |
|------|-----|-------------|
| 🔴 **Danger** | Vermelho | Problema imediato que requer ação |
| 🟡 **Warning** | Amarelo | Tendência preocupante, monitorar |
| 🟢 **Success** | Verde | Oportunidade ou positive news |

**Exemplos de Alertas:**
- Template com margem decrescente → Warning
- Seg Premium com margem 18% acima da Padrão → Success
- Todos os orçamentos foram rejeitados → Danger

#### 4. **Templates: Análise de Performance**
Cards para cada template mostrando:
- **Usos**: Quantas vezes foi utilizado
- **Margem Média**: Rentabilidade média
- **Multiplicador Médio**: Preço cobrado vs floor
- **Tendência**: ↗️ Crescente | → Estável | ↘️ Decrescente
- **Alerta**: Marca templates que precisam revisão

**Critérios para Revisão:**
- Tendência decrescente por 3+ usos
- Multiplicador baixo (< 1.5x) com poucos usos (< 5)
- Margem abaixo da meta (< 35%)

#### 5. **Tabela de Orçamentos Completa**
Colunas:
| Campo | Descrição |
|-------|-----------|
| Data | Quando foi emitido |
| Cliente | Nome do cliente |
| Template | Qual template foi usado (se houver) |
| Preço Floor | Custo mínimo (baseado em horas × hora-vendida) |
| Preço Praticado | Preço cobrado ao cliente |
| Multiplicador | Praticado ÷ Floor (quantas vezes) |
| Margem % | Lucro sobre floor |
| Status | Rascunho / Enviado / Aprovado / Rejeitado |

#### 6. **Filtros e Exportação**
- **Filtros**: Por período (padrão: últimos 30 dias) e por template
- **Botão Exportar CSV**: Baixa tabela para análise em Excel
- CSV inclui: data, cliente, template, floor, praticado, multiplicador, margem%, status

---

## 🏠 Dashboard Home — Alertas

Localização: `/`

### Novos Alertas Contextuais

Seção imediatamente após os **Stats Cards**, mostrando:

1. **Orçamentos em Espera**
   - Mostra count de orçamentos com status "enviado"
   - Ícone ⏳ (warning)
   - CTA: Ir para auditoria para acompanhar

2. **Orçamentos Rejeitados**
   - Mostra count de rejeitados
   - Ícone ⚠️ (danger - vermelho)
   - Mensagem: "Revisar estratégia de preços"

3. **Baixa Margem**
   - Orçamentos aprovados com margem < 35%
   - Ícone 💰 (warning)
   - Count: quantos orçamentos fora da meta

4. **Oportunidade Premium**
   - Se houver ≥3 clientes Padrão, sugerir upgrade para Premium
   - Ícone ✨ (success)
   - Mensagem: Potencial incremento de revenue

5. **Empty State**
   - Se zero orçamentos: "Comece criando seu primeiro orçamento"
   - Ícone 🚀 (success)
   - CTA: "+ Novo Orçamento"

**Cores:**
- Danger: #ef4444 (vermelho)
- Warning: #f59e0b (amarelo)
- Success: #10b981 (verde)

---

## 📚 Biblioteca de Métricas

Localização: `src/lib/auditoria/metricas.ts`

Funções puras (sem side effects):

### Cálculos Básicos
- `calcularMargemReal(floor, praticado)` → número (0-100)
- `calcularMultiplicador(floor, praticado)` → número
- `detectarTendenciaMargem(atual, historica)` → "crescente" | "estavel" | "decrescente"

### Detecção de Problemas
- `detectarTemplatesParaRevisao(templates)` → array de templates
- `detectarAnomaliasPreco(orcamentos)` → array de orçamentos com preço < floor

### Agregações
- `calcularMargemMedia(orcamentos)` → número
- `calcularMultiplicadorMedio(orcamentos)` → número
- `calcularTotalFechado(orcamentos)` → número
- `calcularEvolucaoMargem(orcamentos)` → array { mes, margem }

### Filtros e Validação
- `filtrarOrcamentos(orcamentos, criterios)` → array filtrado
- `agruparOrcamentos(orcamentos, chave)` → object agrupado
- `validarDadosOrcamento(orc)` → array de erros (vazio = válido)

**Uso:**
```typescript
import * as Metricas from '@/lib/auditoria/metricas'

const margem = Metricas.calcularMargemReal(1000, 1500); // 50%
const tendencia = Metricas.detectarTendenciaMargem(45, 42); // crescente
const templates = Metricas.detectarTemplatesParaRevisao(mockTemplates);
const evolucao = Metricas.calcularEvolucaoMargem(orcamentos);
```

---

## 🎨 Design System

### Cores (GAMA V3 Dark Mode)
- **Primary**: #88CE11 (verde lima)
- **Primary-dim**: rgba(136, 206, 17, 0.1) — fundo atenuado
- **Danger**: #ef4444 (vermelho)
- **Warning**: #f59e0b (amarelo)
- **Success**: #10b981 (verde)
- **Background**: var(--bg) — preto/cinza escuro
- **Surface**: var(--surface) — cinza médio
- **Text**: var(--text-1), var(--text-2), var(--text-3) — níveis de contraste

### Tipografia
- **Headings**: fontWeight 800-900, fontSize 18-26px
- **Body**: fontWeight 600, fontSize 13-14px
- **Labels**: fontSize 12px, fontWeight 700, color var(--text-2)

### Spacing & Radius
- **Padding cards**: 16-20px
- **Gap entre cards**: 16px
- **Radius**: var(--radius) (padrão) | var(--radius-sm) (inputs)

---

## 🧪 Checklist de Validação (Ação 5)

### Visual
- [x] Dark mode ativado e legível
- [x] Alertas coloridos corretamente (danger/warning/success)
- [x] Gráfico Recharts renderiza sem erro
- [x] Tabelas com scroll horizontal em mobile
- [x] Spacing consistente entre seções

### Funcional
- [x] Alertas aparecem apenas quando há dados
- [x] Filtros funcionam (período, template)
- [x] CSV exporta com encoding correto
- [x] Links de navegação funcionam
- [x] Sem console errors

### Performance
- [x] Build sem warnings
- [x] Auditoria page carrega < 2s
- [x] Home page carrega < 1s
- [x] Charts renderizam smooth (Recharts otimizado)

### Dados
- [x] Margem calculada corretamente (floor vs praticado)
- [x] Multiplicador correto
- [x] Tendências detectadas properly
- [x] Evolução calcula mês a mês

---

## 📋 Próximos Passos (Ação 7 — Final Cleanup)

1. **Limpar teste-motor page**
   - Deletar: `src/app/teste-motor/page.tsx`
   - Não mais necessário (motor está integrado)

2. **Arquivar legacy**
   - Mover schema antigo para `_legacy/`
   - Documentar no `_legacy/MIGRACAO_SCHEMA.md`

3. **Atualizar versão**
   - package.json: `"version": "1.0.0"`
   - Primeiro release oficial

4. **Git tag**
   ```bash
   git tag v1.0.0-gama-orcamento-fase-6
   ```

5. **Commit final**
   ```bash
   git commit -m "Fase 6: Auditoria + Polimento Final [v1.0.0]"
   ```

---

## 📄 Checklist Geral de Conclusão

- [x] Ação 1: Audit screen criada
- [x] Ação 2: Evolution graph implementada (Recharts)
- [x] Ação 3: Dashboard alerts adicionado
- [x] Ação 4: Metricas library criada (lib/auditoria/metricas.ts)
- [x] Ação 5: Validação visual/funcional completa
- [x] Ação 6: Documentação (este arquivo)
- [ ] Ação 7: Cleanup final (próximo passo)
- [ ] Ação 8: Relatório final (próximo passo)

---

## 🎯 Métricas de Sucesso (v1.0.0)

### Funcionalidades
- ✅ Rate Card calculada automaticamente
- ✅ Preço floor baseado em horas × hora-vendida
- ✅ Sugestões de preço (3 lentes: histórico, multiplicador, contexto)
- ✅ Auditoria com alertas automáticos
- ✅ Templates com análise de performance
- ✅ CSV export para análise offline

### Qualidade
- ✅ Zero TypeScript errors
- ✅ Build passing
- ✅ Dark mode 100% legível
- ✅ Design System GAMA V3 aplicado
- ✅ Funções puras de cálculo (testáveis)

### Documentação
- ✅ README.md completo (este arquivo)
- ✅ Funções documentadas com JSDoc
- ✅ Tipos TypeScript claros
- ✅ Exemplos de uso

---

**Data**: 2026-05-15  
**Versão**: 1.0.0  
**Status**: 🟢 Pronto para Produção Local
