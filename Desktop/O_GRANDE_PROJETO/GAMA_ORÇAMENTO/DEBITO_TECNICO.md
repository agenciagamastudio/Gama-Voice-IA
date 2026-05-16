# Débito Técnico — GAMA Orçamento

**Data:** 2026-05-16  
**Status:** Documentado | Não Bloqueante | Priorizado para próximas sessões  
**Impacto:** Visual/UX | Navegação

---

## 1. Inconsistência Visual Entre Telas

### Problema
Tela `/orcamentos` (Lista) tem componentes legacy sem refatoração completa para Design System V3:

- **Tabs de filtro** (Todos/Rascunho/Pendente/etc)
  - Aparência: text simples, não "tabs" visuais
  - Esperado: abas com background, highlight no ativo, borda inferior

- **Botão "+ Novo Orçamento"**
  - Aparência: sem fill de cor primária (#88ce11)
  - Esperado: verde GAMA com texto branco, hover state

- **Botão "Abrir"**
  - Aparência: sem aparência de botão (talvez apenas link)
  - Esperado: botão com border ou background, hover state

- **Banner "Fluxo de Orçamento"**
  - Aparência: azul destoa do dark mode
  - Esperado: cinza escuro com accent verde GAMA

### Solução Sugerida
Em sessão futura dedicada à atualização de Design System:

1. Ler `C:\Users\Usuario\Desktop\O_GRANDE_PROJETO\GAMA_BRANDBOOK_V3\gama-ds-platform`
2. Identificar componentes prontos (Button, Tab, Banner, Card)
3. Se prontos: importar e aplicar no GAMA Orçamento
4. Se não: extrair tokens (cores, tipografia, espaçamento) e criar componentes consistentes
5. Validar visualmente em todas as rotas

### Prioridade
🟡 Média — Não bloqueante, mas afeta experiência visual

### Tempo Estimado
3-4 horas (investigação + implementação)

---

## 2. Navegação Quebrada na Tela /orcamentos

### Problema
Dashboard tem header de navegação completo (Auditoria | Lixeira | Catálogo | Empresa | + Novo Orçamento), mas tela `/orcamentos` NÃO tem esse header.

**Resultado:** Usuário fica "preso" na tela sem botão pra voltar ao Dashboard ou navegar pra outras telas.

### Root Cause Provável
Componente de header/navegação está definido em `app/page.tsx` (apenas Dashboard) ao invés de `app/layout.tsx` (todas as rotas).

### Solução Sugerida
1. Verificar onde `Header` está implementado (app/page.tsx ou app/layout.tsx?)
2. Se em `app/page.tsx`: mover para `app/layout.tsx` (raiz)
3. Se em `app/layout.tsx`: debugar por que não aparece em `/orcamentos`
4. Auditar todas as rotas do sistema:
   - `/orcamentos` (lista)
   - `/orcamentos/novo` (construtor)
   - `/orcamentos/[id]` (detalhes)
   - `/auditoria`
   - `/lixeira`
   - `/configuracoes` (se existir)
5. Confirmar que TODAS têm navegação consistente

### Prioridade
🔴 Alta — Bloqueia navegação do usuário

### Tempo Estimado
2-3 horas (investigação + refatoração)

---

## 3. Pricing Suggestions — Dados Seed Insuficientes

### Problema
Sistema de 3 sugestões de preço está implementado, mas sem dados históricos no banco para testar lógica real.

**Validação feita:**
- ✅ Fallback por tag (Padrão/Premium/etc) funcionando
- ✅ API `/api/sugestoes` retornando JSON correto
- ❌ Histórico real (lógica com 5+ orçamentos) não testado

### Solução Sugerida
Criar seed script que insere dados históricos para testar:

1. **6-10 orçamentos** com status="Aprovado", distribuídos por tag
2. Rodar novo orçamento e validar:
   - Cards mostram ✅ "histórico" em verde
   - Amostras contam corretamente
   - Convergência muda de "sem_dados" pra "total/parcial/divergente"
3. Documentar seed em `prisma/seed.ts` para futuras instâncias

### Prioridade
🟡 Média — Funcionalidade pronta, só falta validação completa

### Tempo Estimado
1-2 horas (seed script + testes)

---

## Summary

| Item | Prioridade | Tempo | Status |
|------|-----------|-------|--------|
| Inconsistência visual (Tabs/Botões/Banner) | 🟡 Média | 3-4h | Documentado |
| Navegação quebrada (/orcamentos) | 🔴 Alta | 2-3h | Documentado |
| Pricing: dados seed insuficientes | 🟡 Média | 1-2h | Documentado |

**Total:** ~6-9 horas de trabalho futuro

**Recomendação:** Resolver em ordem: Navegação (bloqueante) → Pricing Seed (validação) → Visual (polimento)

---

**Criado em:** 2026-05-16  
**Sessão:** Implementação das 3 Sugestões de Preço  
**Próxima Ação:** Atualização Design System + Resolução desses débitos
