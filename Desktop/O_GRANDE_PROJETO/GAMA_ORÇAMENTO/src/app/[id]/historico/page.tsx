"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getVersionHistory, getById } from "@/lib/storage";
import { fmt } from "@/lib/utils";
import type { OrcamentoHistorico, OrcamentoVersion } from "@/types/orcamento";

export default function HistoricoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [history, setHistory] = useState<OrcamentoHistorico | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = getVersionHistory(id);
    if (!found) {
      const orc = getById(id);
      if (!orc) {
        router.push("/");
        return;
      }
    }
    setHistory(found);
    setLoading(false);
  }, [id, router]);

  const handleViewVersion = (versaoNumero: number) => {
    router.push(`/${id}/versao/${versaoNumero}`);
  };

  const handleCompare = () => {
    if (history && history.versoes.length >= 2) {
      const latest = history.versoes[history.versoes.length - 1];
      const previous = history.versoes[history.versoes.length - 2];
      router.push(`/${id}/comparar?v1=${previous.versao_numero}&v2=${latest.versao_numero}`);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
        Carregando...
      </div>
    );
  }

  if (!history || history.versoes.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <div className="no-print" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <a href={`/${id}/preview`} style={{ color: "var(--text-3)", fontSize: 18 }}>←</a>
          <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Histórico de Versões</h1>
          <div style={{ width: 20 }} />
        </div>
        <div style={{ padding: "24px", textAlign: "center", color: "var(--text-2)" }}>
          <p>Este orçamento ainda não tem histórico de versões.</p>
        </div>
      </div>
    );
  }

  const sortedVersions = [...history.versoes].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="no-print" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <a href={`/${id}/preview`} style={{ color: "var(--text-3)", fontSize: 18 }}>←</a>
        <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Histórico de Versões</h1>
        {history.versoes.length >= 2 && (
          <button
            onClick={handleCompare}
            style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#0a0a0a", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            🔄 Comparar Últimas
          </button>
        )}
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sortedVersions.map((version, idx) => {
            const subtotal = version.orcamento.itens.reduce((s, i) => s + i.total, 0);
            const desconto = version.orcamento.desconto_percentual > 0 ? subtotal * (version.orcamento.desconto_percentual / 100) : 0;
            const total = subtotal - desconto;
            const date = new Date(version.criado_em);

            return (
              <div
                key={version.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "16px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                onClick={() => handleViewVersion(version.versao_numero)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}>
                      Versão #{version.versao_numero}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>
                      {date.toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, fontSize: 16, color: "var(--primary)" }}>
                      {fmt(total)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>
                      {version.orcamento.itens.length} itens
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-3)", marginRight: 8 }}>Motivo:</span>
                  {version.motivo}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
