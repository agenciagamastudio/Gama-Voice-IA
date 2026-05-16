import BudgetTemplate from "@/components/BudgetTemplate";
import type { Orcamento } from "@/types/orcamento";

const MOCK_ORCAMENTO: Orcamento = {
  id: "orc-001",
  numero: "ORÇ-2025-001",
  status: "enviado",
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
      entregavelId: "ent-1",
      nome: "Post Estático",
      quantidade: 8,
      profissional: "Designer",
      tempoMinutos: 20,
      horaVendida: 108.61,
      precoFloorUnitario: 36.20,
      subtotal: 289.62,
    },
    {
      id: "item-2",
      entregavelId: "ent-2",
      nome: "Reels",
      quantidade: 8,
      profissional: "Editor",
      tempoMinutos: 15,
      horaVendida: 74.86,
      precoFloorUnitario: 18.72,
      subtotal: 149.76,
    },
    {
      id: "item-3",
      entregavelId: "ent-3",
      nome: "Estratégia Mensal",
      quantidade: 1,
      profissional: "Estratégia",
      tempoMinutos: 120,
      horaVendida: 142.36,
      precoFloorUnitario: 284.72,
      subtotal: 284.72,
    },
    {
      id: "item-4",
      entregavelId: "ent-4",
      nome: "Gestão de Redes (mensal)",
      quantidade: 1,
      profissional: "Gestão",
      tempoMinutos: 300,
      horaVendida: 88.36,
      precoFloorUnitario: 441.80,
      subtotal: 441.80,
    },
  ],
  datas: {
    emissao: "14 de maio de 2025",
    validade: "28 de maio de 2025",
  },
  tagContexto: "padrao",
  precoFloor: 1165.90,
  precoPraticado: 1850.00,
  multiplicador: 1.587,
  termos:
    "1. Pagamento: 50% de entrada, saldo em 7 dias\n2. Cronograma: Entrega em até 5 dias úteis após aprovação\n3. Revisões: Até 2 rodadas de revisão incluídas\n4. Cancelamento: Passível de taxa se realizado em até 48h da contratação",
  garantia:
    "Garantimos a qualidade de todos os materiais entregues. Em caso de problemas, fazemos correções sem custo adicional dentro de 30 dias.",
  criado_em: "2025-05-14T10:30:00Z",
  atualizado_em: "2025-05-14T10:30:00Z",
};

export default function ExportarPage() {
  return <BudgetTemplate orcamento={MOCK_ORCAMENTO} />;
}
