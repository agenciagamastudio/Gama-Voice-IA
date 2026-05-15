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
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
      Carregando...
    </div>
  );

  const { orcamento } = version;
  const subtotal = orcamento.itens.reduce((s, i) => s + i.total, 0);
  const desconto = orcamento.desconto_percentual > 0 ? subtotal * (orcamento.desconto_percentual / 100) : 0;
  const total = subtotal - desconto;
  const date = new Date(version.criado_em);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="no-print" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href={`/${id}/historico`} style={{ color: "var(--text-3)", fontSize: 18 }}>←</a>
          <div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Versão #{version.versao_numero}</span>
            <span style={{ margin: "0 8px", color: "var(--text-3)" }}>·</span>
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>{date.toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 16, color: "var(--primary)" }}>{fmt(total)}</span>
          <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            🖨 Exportar PDF
          </button>
        </div>
      </div>

      <div style={{ padding: "16px 32px 48px" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: 24, fontSize: 12, color: "var(--text-2)" }}>
          <strong>Motivo da alteração:</strong> {version.motivo}
        </div>
        <OrcamentoDoc orc={orcamento} />
      </div>
    </div>
  );
}
