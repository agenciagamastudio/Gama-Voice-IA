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
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
      Carregando...
    </div>
  );

  const subtotal = orc.itens.reduce((s, i) => s + i.total, 0);
  const desconto = orc.desconto_percentual > 0 ? subtotal * (orc.desconto_percentual / 100) : 0;
  const total = subtotal - desconto;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Topbar */}
      <div className="no-print" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href="/" style={{ color: "var(--text-3)", fontSize: 18 }}>←</a>
          <div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Orçamento #{orc.numero}</span>
            <span style={{ margin: "0 8px", color: "var(--text-3)" }}>·</span>
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>{orc.cliente.nome}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 16, color: "var(--primary)" }}>{fmt(total)}</span>
          <button onClick={handleViewHistory} style={{ padding: "7px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            📋 Histórico
          </button>
          <a href={`/${orc.id}/editar`} style={{ padding: "7px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 12, fontWeight: 600 }}>
            ✏️ Editar
          </a>
          <button onClick={handleUpdatePrices} disabled={isUpdating} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--secondary)", color: "var(--text-1)", fontWeight: 800, fontSize: 13, cursor: isUpdating ? "not-allowed" : "pointer", opacity: isUpdating ? 0.6 : 1 }}>
            🔄 {isUpdating ? "Atualizando..." : "Atualizar Preços"}
          </button>
          <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            🖨 Exportar PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div style={{ padding: "24px 32px 48px" }}>
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
