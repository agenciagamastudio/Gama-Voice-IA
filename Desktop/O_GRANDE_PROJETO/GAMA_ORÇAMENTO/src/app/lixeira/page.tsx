"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTrash, restoreFromTrash, deletePermanently, emptyTrash, getAll } from "@/lib/storage";
import { fmt } from "@/lib/utils";
import type { Orcamento, OrcamentoStatus } from "@/types/orcamento";

const STATUS_COLOR: Record<OrcamentoStatus, string> = {
  Aprovado: "success",
  Pendente: "warning",
  Rejeitado: "error",
  Rascunho: "slate-500",
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
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-gama-border backdrop-blur-md bg-gama-surface/40">
          <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gama-primary to-[primary-light] bg-clip-text text-transparent">🗑️ Lixeira</h1>
            <Link href="/" className="px-4 py-2 bg-gama-surface/50 border border-gama-border rounded-lg text-gama-text font-medium hover:border-gama-primary/50 transition-colors text-sm">
              ← Voltar
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Description */}
          <div className="mb-8">
            <p className="text-gama-text-secondary text-sm">Aqui estão os orçamentos que você moveu para a lixeira. Você pode restaurá-los ou deletá-los permanentemente.</p>
          </div>

          {/* Empty state */}
          {trash.length === 0 && (
            <div className="glass glass-card h-64 flex flex-col items-center justify-center">
              <p className="text-3xl mb-4">🗑️</p>
              <h3 className="text-white text-lg font-bold mb-2">Lixeira vazia</h3>
              <p className="text-gama-text-secondary mb-6">Seus orçamentos deletados aparecerão aqui.</p>
              <Link href="/" className="px-6 py-2 bg-gama-primary/20 border border-gama-primary text-gama-primary rounded-lg hover:bg-gama-primary/30 transition-all font-medium">
                ← Voltar para lista
              </Link>
            </div>
          )}

          {/* Empty trash button */}
          {trash.length > 0 && (
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setConfirmEmptyTrash(true)}
                className="px-4 py-2 bg-[error]/10 border border-[error]/30 rounded-lg text-[error] text-sm font-medium hover:bg-[error]/20 transition-colors"
              >
                Esvaziar Lixeira
              </button>
            </div>
          )}

          {/* List */}
          {trash.length > 0 && (
            <div className="space-y-3">
              {trash.map((orc) => {
                const sub = orc.itens.reduce((a, i) => a + i.total, 0);
                const desc = orc.desconto_percentual > 0 ? sub * (orc.desconto_percentual / 100) : 0;
                const total = sub - desc;
                return (
                  <div key={orc.id} className="glass glass-card p-4 flex items-center justify-between group hover:border-gama-primary/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-white">{orc.cliente.nome || "Cliente sem nome"}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-[rgba(136,206,17,0.1)] border border-gama-primary/20 text-gama-primary font-semibold">{orc.status}</span>
                      </div>
                      <div className="text-xs text-gama-text-secondary">
                        #{orc.numero} · Emitido {orc.datas.emissao} · {orc.itens.length} item{orc.itens.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div className="text-right mr-6">
                      <div className="font-black text-lg text-gama-primary">{fmt(total)}</div>
                      {orc.desconto_percentual > 0 && <div className="text-xs text-gama-text-secondary">−{orc.desconto_percentual}% desc.</div>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        title="Restaurar"
                        onClick={() => setConfirmRestore(orc.id)}
                        className="px-3 py-2 bg-gama-surface/50 border border-gama-border rounded text-gama-text text-sm font-medium hover:border-gama-primary/50 transition-colors"
                      >
                        ↩️
                      </button>
                      <button
                        title="Deletar permanentemente"
                        onClick={() => setConfirmDeletePerm(orc.id)}
                        className="px-3 py-2 bg-[error]/10 border border-[error]/30 rounded text-[error] text-sm font-medium hover:bg-[error]/20 transition-colors"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
