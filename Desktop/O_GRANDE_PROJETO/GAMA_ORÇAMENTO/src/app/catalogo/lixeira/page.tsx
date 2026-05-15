"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCatalogTrash, restoreCatalogFromTrash, deleteCatalogPermanently, emptyCatalogTrash } from "@/lib/storage";
import { fmt } from "@/lib/utils";
import type { CatalogItem } from "@/types/orcamento";

export default function CatalogTrashPage() {
  const [trash, setTrash] = useState<CatalogItem[]>([]);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [confirmDeletePerm, setConfirmDeletePerm] = useState<string | null>(null);
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);

  useEffect(() => { setTrash(getCatalogTrash()); }, []);

  const handleRestore = (id: string) => {
    restoreCatalogFromTrash(id);
    setTrash(getCatalogTrash());
    setConfirmRestore(null);
  };

  const handleDeletePermanently = (id: string) => {
    deleteCatalogPermanently(id);
    setTrash(getCatalogTrash());
    setConfirmDeletePerm(null);
  };

  const handleEmptyTrash = () => {
    emptyCatalogTrash();
    setTrash(getCatalogTrash());
    setConfirmEmptyTrash(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Topbar */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#0a0a0a" }}>G</div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>GAMA <span style={{ color: "var(--primary)" }}>Catálogo - Lixeira</span></span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/catalogo" style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            ← Voltar
          </Link>
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Lixeira do Catálogo</h1>
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>Serviços e produtos deletados. Você pode restaurá-los ou deletá-los permanentemente.</p>
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
            <div style={{ color: "var(--text-2)", marginBottom: 24 }}>Serviços deletados aparecerão aqui.</div>
            <Link href="/catalogo" style={{ padding: "10px 24px", borderRadius: "var(--radius-sm)", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, fontSize: 14 }}>
              ← Voltar ao Catálogo
            </Link>
          </div>
        )}

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {trash.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.nome}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>
                  Categoria: {item.categoria}
                </div>
                {item.descricao && (
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                    {item.descricao}
                  </div>
                )}
              </div>

              {/* Preço */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: "var(--primary)" }}>{fmt(item.preco)}</div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  title="Restaurar"
                  onClick={() => setConfirmRestore(item.id)}
                  style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}
                >
                  ↩️
                </button>
                <button
                  title="Deletar permanentemente"
                  onClick={() => setConfirmDeletePerm(item.id)}
                  style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "var(--text-2)" }}
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm restore modal */}
      {confirmRestore && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setConfirmRestore(null)}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, maxWidth: 360, width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Restaurar serviço?</div>
            <div style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 14 }}>O serviço será restaurado para o catálogo.</div>
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
            <div style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 14 }}>Essa ação é irreversível. O serviço será deletado permanentemente.</div>
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
            <div style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 14 }}>Todos os serviços na lixeira serão deletados permanentemente. Essa ação é irreversível.</div>
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
