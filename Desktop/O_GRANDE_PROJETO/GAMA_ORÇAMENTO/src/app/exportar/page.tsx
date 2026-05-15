import BudgetTemplate from "@/components/BudgetTemplate";
import type { Orcamento } from "@/types/orcamento";

const MOCK_ORCAMENTO: Orcamento = {
  id: "orc-001",
  numero: "ORÇ-2025-001",
  status: "Aprovado",
  empresa: {
    nome: "GAMA Studio",
    logo_text: "GAMA",
    cnpj: "00.000.000/0000-00",
    endereco: "Rua Exemplo, 123 - São Paulo, SP",
    telefone: "(11) 99999-9999",
    email: "contato@gama.com.br",
  },
  cliente: {
    nome: "Empresa Exemplo LTDA",
    cpf_cnpj: "12.345.678/0001-90",
    contato: "João Silva",
    email: "joao@empresa.com.br",
    endereco: "Avenida Paulista, 1000 - São Paulo, SP",
  },
  itens: [
    {
      id: "item-1",
      descricao: "Post para Instagram - Design + Copywriting + Revisões (2 rodadas)",
      quantidade: 8,
      preco_unitario: 250.0,
      total: 2000.0,
    },
    {
      id: "item-2",
      descricao: "Reel de 30-60 segundos - Edição profissional + efeitos + áudio",
      quantidade: 4,
      preco_unitario: 500.0,
      total: 2000.0,
    },
    {
      id: "item-3",
      descricao: "Stories animadas (série de 5 quadros)",
      quantidade: 12,
      preco_unitario: 120.0,
      total: 1440.0,
    },
    {
      id: "item-4",
      descricao: "Consultoria estratégica de conteúdo (1h)",
      quantidade: 2,
      preco_unitario: 300.0,
      total: 600.0,
    },
  ],
  datas: {
    emissao: "14 de maio de 2025",
    validade: "28 de maio de 2025",
  },
  desconto_percentual: 10,
  termos:
    "1. Pagamento: 50% de entrada, saldo em 7 dias\n2. Cronograma: Entrega em até 5 dias úteis após aprovação\n3. Revisões: Até 2 rodadas de revisão incluídas\n4. Cancellamento: Passível de taxa se realizado em até 48h da contratação",
  garantia:
    "Garantimos a qualidade de todos os materiais entregues. Em caso de problemas, fazemos correções sem custo adicional dentro de 30 dias.",
  criado_em: "2025-05-14T10:30:00Z",
  atualizado_em: "2025-05-14T10:30:00Z",
};

export default function ExportarPage() {
  return <BudgetTemplate orcamento={MOCK_ORCAMENTO} />;
}
