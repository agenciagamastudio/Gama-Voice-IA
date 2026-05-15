"use client";

import { useMemo } from "react";
import StudioEditor from "@/components/StudioEditor";
import { getAll, getEmpresa } from "@/lib/storage";
import { genId, genNumero, today, addDays } from "@/lib/utils";
import type { Orcamento } from "@/types/orcamento";

export default function NovoPage() {
  const initial = useMemo<Orcamento>(() => {
    const empresa = getEmpresa();
    const count = getAll().length;
    return {
      id: genId(),
      numero: genNumero(count),
      status: "Rascunho",
      empresa,
      cliente: { nome: "", cpf_cnpj: "", contato: "", email: "", endereco: "" },
      itens: [],
      datas: { emissao: today(), validade: addDays(30) },
      desconto_percentual: 0,
      termos: "Este orçamento é válido pelo período informado. Pagamento conforme negociação. A execução está sujeita à confirmação do pedido.",
      garantia: "Garantia conforme legislação vigente e condições específicas da proposta.",
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
  }, []);

  return <StudioEditor initial={initial} isNew />;
}
