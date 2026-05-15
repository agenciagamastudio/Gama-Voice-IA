# BudgetTemplate — Componente de Exportação de Orçamento

## Descrição

Componente React reutilizável para exportação e visualização de orçamentos em formato profissional, otimizado para impressão em A4.

## Features

✅ **Layout responsivo** — Funciona em tela e otimizado para print  
✅ **CSS @media print** — Quebras de página inteligentes, sem botões na impressão  
✅ **TypeScript completo** — Tipos bem definidos  
✅ **Dados dinâmicos** — Aceita qualquer objeto `Orcamento`  
✅ **Design profissional** — Cores, tipografia e espaçamento otimizados  
✅ **Acesso rápido** — Botão "Exportar para PDF" nativo do navegador  

## Uso

### Básico

```tsx
import BudgetTemplate from "@/components/BudgetTemplate";
import type { Orcamento } from "@/types/orcamento";

export default function ExporterPage() {
  const orcamento: Orcamento = { /* ... */ };
  
  return <BudgetTemplate orcamento={orcamento} />;
}
```

### Com callback de print

```tsx
<BudgetTemplate 
  orcamento={orcamento} 
  onPrint={() => console.log("Printing...")}
/>
```

## Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-----------|-----------|
| `orcamento` | `Orcamento` | ✅ Sim | Objeto do orçamento com todos os dados |
| `onPrint` | `() => void` | ❌ Não | Callback executado ao clicar em "Exportar para PDF" |

## Estrutura do Orcamento

```typescript
interface Orcamento {
  id: string;
  numero: string;
  status: "Aprovado" | "Pendente" | "Rejeitado" | "Rascunho";
  empresa: {
    nome: string;
    logo_text?: string;
    logo_url?: string;
    cnpj: string;
    endereco: string;
    telefone: string;
    email: string;
    instagram?: string;
  };
  cliente: {
    nome: string;
    cpf_cnpj: string;
    contato: string;
    email: string;
    endereco: string;
    instagram?: string;
  };
  itens: Array<{
    id: string;
    descricao: string;
    quantidade: number;
    preco_unitario: number;
    total: number;
  }>;
  datas: {
    emissao: string;
    validade: string;
  };
  desconto_percentual: number;
  termos: string;
  garantia: string;
  criado_em: string;
  atualizado_em: string;
}
```

## Layout

### Seções (ordem visual)

1. **Header** — Logo/nome empresa, número do orçamento, status com cor  
2. **Informações do Cliente** — Nome, CNPJ, contato, email  
3. **Tabela de Itens** — Descrição, quantidade, preço unitário, total  
4. **Totais** — Subtotal, desconto, valor final  
5. **Datas e Termos** — Emissão, validade, garantia, termos  
6. **Assinatura** — Linha para assinatura manual  

### Cores por Status

| Status | Cor |
|--------|-----|
| Aprovado | Green (#10b981) |
| Pendente | Amber (#f59e0b) |
| Rejeitado | Red (#ef4444) |
| Rascunho | Gray (#6b7280) |

## Impressão / Exportação

### Como usar

1. Clique no botão **"Exportar para PDF"**
2. O navegador abre o diálogo de impressão
3. Em "Destino", selecione **"Guardar como PDF"**
4. Clique em **"Guardar"**

### Otimizações de Print

✅ Página A4 portrait com margens 15mm × 18mm  
✅ Tabela de itens nunca quebra no meio de uma linha  
✅ Headers da tabela repetem em cada página (se houver múltiplas)  
✅ Cores e estilos preservados exatamente como na tela  
✅ Botões e controles não aparecem na impressão  
✅ Sem fundo cinzento da tela  

### CSS Print

O arquivo `BudgetTemplate.module.css` contém:

```css
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm 18mm;
  }
  /* ... */
  tr { page-break-inside: avoid; }
  thead { display: table-header-group; }
}
```

## Ficheiro de Exemplo

Veja `/src/app/exportar/page.tsx` para um exemplo completo com dados mockados.

## Customização

### Alterar cores

Modifique em `BudgetTemplate.module.css`:

```css
.status {
  background-color: #10b981; /* Verde padrão */
}

.divider {
  border-top: 2px solid #e5e7eb; /* Cinza padrão */
}
```

### Alterar fontes

Em `BudgetTemplate.module.css`:

```css
.document {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

### Adicionar logo

Modifique a seção `Header` em `BudgetTemplate.tsx`:

```tsx
{orcamento.empresa.logo_url && (
  <img src={orcamento.empresa.logo_url} alt="Logo" style={{ maxWidth: 120 }} />
)}
```

## Compatibilidade

| Navegador | Status |
|-----------|--------|
| Chrome | ✅ Funcionando |
| Firefox | ✅ Funcionando |
| Safari | ✅ Funcionando |
| Edge | ✅ Funcionando |

## Performance

- **Sem re-renders desnecessários** — Component usa `React.FC`
- **CSS modular** — Estilos isolados em `.module.css`
- **Sem dependências externas** — Usa apenas React + CSS puro

## Notas

- O componente é **responsivo** em telas pequenas (redimensiona tabelas e grid)
- **Não depende** de html2pdf.js — usa impressão nativa do navegador  
- **Acessível** — Semântica HTML correta, contraste adequado, sem ARIA obrigatória  

## Próximas Melhorias (Opcional)

- [ ] Adicionar logo da empresa como imagem
- [ ] Suporte a múltiplas páginas com paginação automática
- [ ] Temas customizáveis (cores, tipografia)
- [ ] QR code com link para o orçamento online
- [ ] Assinatura digital (signature pad)
- [ ] Exportação direta para PDF no backend (sem navegador)

## Testes

Para testar o componente:

1. Acesse `http://localhost:3002/exportar`
2. Visualize a renderização na tela
3. Clique em "Exportar para PDF" para testar impressão
4. Modifique dados em `/src/app/exportar/page.tsx` e test com diferentes cenários

---

**Versão:** 1.0.0  
**Data:** Maio 2025  
**Projeto:** GAMA Orçamento  
