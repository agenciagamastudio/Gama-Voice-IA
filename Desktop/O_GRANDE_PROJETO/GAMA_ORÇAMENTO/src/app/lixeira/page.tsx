"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTrash, restoreFromTrash, deletePermanently, emptyTrash, getAll } from "@/lib/storage";
import { fmt } from "@/lib/utils";
import type { Orcamento, OrcamentoStatus } from "@/types/orcamento";

const STATUS_COLOR: Record<OrcamentoStatus, string> = {
  Aprovado: "#10b981",
  Pendente: "#f59e0b",
  Rejeitado: "#e11d48",
  Rascunho: "#71717a",
};

const STATUS_BG: Record<OrcamentoStatus, string> = {
  Aprovado: "rgba(16,185,129,0.12)",
  Pendente: "rgba(245,158,11,0.12)",
  Rejeitado: "rgba(225,29,72,0.12)",
  Rascunho: "rgba(113,113,122,0.12)",
};

export default function LixeiraPage() {
  const [trash, setTrash] = useState<Orcamento[]>([]);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [confirmDeletePerm, setConfirmDeletePerm] = useState<string | null>(null);
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);

  useEffect(() => { setTrash(getTrash()); }, []);

  const handleRestore = (id: string) => {
    restoreFromTrash(id);
    setTrash(getTrash());
    setConfirmRestore(null);
  };

  const handleDeletePermanently = (id: string) => {
    deletePermanently(id);
    setTrash(getTrash());
    setConfirmDeletePerm(null);
  };

  const handleEmptyTrash = () => {
    emptyTrash();
    setTrash(getTrash());
    setConfirmEmptyTrash(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Topbar */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#0a0a0a" }}>G</div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>GAMA <span style={{ color: "var(--primary)" }}>Lixeira</span></span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/" style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            ← Voltar
          </Link>
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Lixeira</h1>
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>Aqui estão os orçamentos que você moveu para a lixeira. Você pode restaurá-los ou deletá-los permanentemente.</p>
          </div>
          {trash.length > 0 && (
            <button
              onClick={() => setConfirmEmptyTrash(true)}
              style={{ padding: "10px 20px", borderRadius: "var(--radius-sm)", border: "1px solid var(--error)", background: "transparent", color: "var(--error)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Esvaziar Lixeira
            </button>
          )}
        </div>

        {/* Empty state */}
        {trash.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Lixeira vazia</div>
            <div style={{ color: "var(--text-2)", marginBottom: 24 }}>Seus orçamentos deletados aparecerão aqui.</div>
            <Link href="/" style={{ padding: "10px 24px", borderRadius: "var(--radius-sm)", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, fontSize: 14 }}>
              ← Voltar para lista
            </Link>
          </div>
        )}

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {trash.map((orc) => {
            const sub = orc.itens.reduce((a, i) => a + i.total, 0);
            const desc = orc.desconto_percentual > 0 ? sub * (orc.desconto_percentual / 100) : 0;
            const total = sub - desc;
            return (
              <div key={orc.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", transition: "border-color 0.15s" }}>
                {/* Status dot */}
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLOR[orc.status], flexShrink: 0 }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{orc.cliente.nome || "Cliente sem nome"}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: STATUS_BG[orc.status], color: STATUS_COLOR[orc.status], fontWeight: 700 }}>{orc.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                    #{orc.numero} · Emitido {orc.datas.emissao} · {orc.itens.length} item{orc.itens.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Valor */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 18, color: "var(--primary)" }}>{fmt(total)}</div>
                  {orc.desconto_percentual > 0 && <div style={{ fontSize: 11, color: "var(--text-3)" }}>−{orc.desconto_percentual}% desc.</div>}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    title="Restaurar"
                    onClick={() => setConfirmRestore(orc.id)}
                    style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}
                  >
                    ↩️
                  </button>
                  <button
                    title="Deletar permanentemente"
                    onClick={() => setConfirmDeletePerm(orc.id)}
                    style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "var(--text-2)" }}
                  >
                    ❌
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm restore modal */}
      {confirmRestore && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setConfirmRestore(null)}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, maxWidth: 360, width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Restaurar orçamento?</div>
            <div style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 14 }}>O orçamento será restaurado para a lista principal.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmRestore(null)} style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontWeight: 600, fontSize: 14 }}>Cancelar</button>
              <button onClick={() => handleRestore(confirmRestore)} style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#0a0a0a", fontWeight: 700, fontSize: 14 }}>Restaurar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete permanently modal */}
      {confirmDeletePerm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setConfirmDeletePerm(null)}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, maxWidth: 360, width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Deletar permanentemente?</div>
            <div style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 14 }}>Essa ação é irreversível. O orçamento será deletado permanentemente.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDeletePerm(null)} style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontWeight: 600, fontSize: 14 }}>Cancelar</button>
              <button onClick={() => handleDeletePermanently(confirmDeletePerm)} style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--error)", color: "#fff", fontWeight: 700, fontSize: 14 }}>Deletar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm empty trash modal */}
      {confirmEmptyTrash && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setConfirmEmptyTrash(false)}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, maxWidth: 360, width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Esvaziar lixeira?</div>
            <div style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 14 }}>Todos os orçamentos na lixeira serão deletados permanentemente. Essa ação é irreversível.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmEmptyTrash(false)} style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontWeight: 600, fontSize: 14 }}>Cancelar</button>
              <button onClick={handleEmptyTrash} style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--error)", color: "#fff", fontWeight: 700, fontSize: 14 }}>Esvaziar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
