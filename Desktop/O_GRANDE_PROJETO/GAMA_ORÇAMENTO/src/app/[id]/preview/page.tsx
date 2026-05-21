"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getById, duplicateWithNewPrices } from "@/lib/storage";
import { fmt } from "@/lib/utils";
import OrcamentoDoc from "@/components/OrcamentoDoc";
import DateSelectorModal from "@/components/DateSelectorModal";
import type { Orcamento } from "@/types/orcamento";

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [orc, setOrc] = useState<Orcamento | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDateSelector, setShowDateSelector] = useState(false);

  useEffect(() => {
    const found = getById(id);
    if (!found) { router.push("/"); return; }
    setOrc(found);
  }, [id, router]);

  const handleUpdatePrices = () => {
    setShowDateSelector(true);
  };

  const handleSelectCatalogDate = (date: string) => {
    setIsUpdating(true);
    const newOrc = duplicateWithNewPrices(id, date);
    setIsUpdating(false);
    if (newOrc) {
      router.push(`/${newOrc.id}/preview`);
    }
  };

  const handleViewHistory = () => {
    router.push(`/${id}/historico`);
  };

  if (!orc) return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] flex items-center justify-center text-slate-400">
      Carregando...
    </div>
  );

  const subtotal = orc.itens.reduce((s, i) => s + i.total, 0);
  const desconto = orc.desconto_percentual > 0 ? subtotal * (orc.desconto_percentual / 100) : 0;
  const total = subtotal - desconto;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2]">
      {/* Topbar */}
      <div className="no-print border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)] px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <a href="/" className="text-slate-500 hover:text-slate-300 transition-colors text-lg">←</a>
          <div>
            <span className="font-bold text-sm">Orçamento #{orc.numero}</span>
            <span className="mx-2 text-slate-600">·</span>
            <span className="text-xs text-slate-400">{orc.cliente.nome}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-black text-base text-[primary]">{fmt(total)}</span>
          <button onClick={handleViewHistory} className="px-4 py-1.5 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 text-xs font-medium hover:border-[primary]/50 transition-colors">
            📋 Histórico
          </button>
          <a href={`/${orc.id}/editar`} className="px-4 py-1.5 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 text-xs font-medium hover:border-[primary]/50 transition-colors">
            ✏️ Editar
          </a>
          <button onClick={handleUpdatePrices} disabled={isUpdating} className="flex items-center gap-2 px-5 py-1.5 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(136,206,17,0.1)] text-white font-bold text-xs hover:bg-[rgba(136,206,17,0.2)] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            🔄 {isUpdating ? "Atualizando..." : "Atualizar Preços"}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-1.5 rounded-lg border-none bg-[primary] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(136,206,17,0.4)] transition-all">
            🖨 Exportar PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="p-6 pb-12">
        <OrcamentoDoc orc={orc} />
      </div>

      {/* Modal de seleção de data */}
      <DateSelectorModal
        isOpen={showDateSelector}
        onClose={() => setShowDateSelector(false)}
        onSelect={handleSelectCatalogDate}
        title="Selecionar preços de qual data?"
      />
    </div>
  );
}
