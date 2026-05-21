"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getVersion } from "@/lib/storage";
import { fmt } from "@/lib/utils";
import OrcamentoDoc from "@/components/OrcamentoDoc";
import type { OrcamentoVersion } from "@/types/orcamento";

export default function VersaoPage() {
  const { id, versao } = useParams<{ id: string; versao: string }>();
  const router = useRouter();
  const [version, setVersion] = useState<OrcamentoVersion | null>(null);

  useEffect(() => {
    const versaoNum = parseInt(versao, 10);
    const found = getVersion(id, versaoNum);
    if (!found) {
      router.push(`/${id}/historico`);
      return;
    }
    setVersion(found);
  }, [id, versao, router]);

  if (!version) return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] flex items-center justify-center text-slate-400">
      Carregando...
    </div>
  );

  const { orcamento } = version;
  const subtotal = orcamento.itens.reduce((s, i) => s + i.total, 0);
  const desconto = orcamento.desconto_percentual > 0 ? subtotal * (orcamento.desconto_percentual / 100) : 0;
  const total = subtotal - desconto;
  const date = new Date(version.criado_em);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2]">
      <div className="no-print border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)] px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <a href={`/${id}/historico`} className="text-slate-500 hover:text-slate-300 transition-colors text-lg">←</a>
          <div>
            <span className="font-bold text-sm">Versão #{version.versao_numero}</span>
            <span className="mx-2 text-slate-600">·</span>
            <span className="text-xs text-slate-400">{date.toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-black text-base text-[primary]">{fmt(total)}</span>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-1.5 rounded-lg border-none bg-[primary] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(136,206,17,0.4)] transition-all">
            🖨 Exportar PDF
          </button>
        </div>
      </div>

      <div className="p-6 pb-12">
        <div className="glass glass-card p-4 mb-6 text-xs text-slate-400">
          <strong>Motivo da alteração:</strong> {version.motivo}
        </div>
        <OrcamentoDoc orc={orcamento} />
      </div>
    </div>
  );
}
