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
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] relative overflow-hidden">
      {/* Volumetric blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, var(--info) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }} />
      </div>

      {/* Topbar */}
      <div className="border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)] px-8 flex items-center justify-between h-16 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[primary] flex items-center justify-center font-black text-xs text-black">G</div>
          <span className="font-bold text-sm">GAMA <span className="text-[primary]">Catálogo - Lixeira</span></span>
        </div>
        <div className="flex gap-2">
          <Link href="/catalogo" className="px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 text-xs font-medium hover:border-[primary]/50 transition-colors flex items-center gap-2">
            ← Voltar
          </Link>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black mb-2">Lixeira do Catálogo</h1>
            <p className="text-slate-400 text-sm">Serviços e produtos deletados. Você pode restaurá-los ou deletá-los permanentemente.</p>
          </div>
          {trash.length > 0 && (
            <button
              onClick={() => setConfirmEmptyTrash(true)}
              className="px-5 py-2 rounded-lg border border-[error]/50 bg-[error]/10 text-[error] font-bold text-xs hover:border-[error] hover:bg-[error]/20 transition-all"
            >
              Esvaziar Lixeira
            </button>
          )}
        </div>

        {/* Empty state */}
        {trash.length === 0 && (
          <div className="text-center py-20 px-5 border border-dashed border-[rgba(148,163,184,0.1)] rounded-xl bg-[rgba(15,23,42,0.3)] backdrop-blur-sm">
            <div className="text-6xl mb-4">🗑️</div>
            <div className="font-bold text-xl mb-2">Lixeira vazia</div>
            <div className="text-slate-400 text-sm mb-6">Serviços deletados aparecerão aqui.</div>
            <Link href="/catalogo" className="inline-block px-6 py-2 rounded-lg bg-[primary] text-black font-bold text-sm hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] transition-all">
              ← Voltar ao Catálogo
            </Link>
          </div>
        )}

        {/* List */}
        <div className="flex flex-col gap-3">
          {trash.map((item) => (
            <div key={item.id} className="glass glass-card p-5 flex items-center gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm mb-1">{item.nome}</div>
                <div className="text-xs text-slate-500 mb-1">
                  Categoria: {item.categoria}
                </div>
                {item.descricao && (
                  <div className="text-xs text-slate-400">
                    {item.descricao}
                  </div>
                )}
              </div>

              {/* Preço */}
              <div className="text-right flex-shrink-0">
                <div className="font-black text-lg text-[primary]">{fmt(item.preco)}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  title="Restaurar"
                  onClick={() => setConfirmRestore(item.id)}
                  className="w-9 h-9 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] flex items-center justify-center text-base hover:border-[primary]/50 hover:bg-[primary]/10 transition-colors"
                >
                  ↩️
                </button>
                <button
                  title="Deletar permanentemente"
                  onClick={() => setConfirmDeletePerm(item.id)}
                  className="w-9 h-9 rounded-lg border border-[error]/50 bg-[error]/10 flex items-center justify-center text-base text-[error] hover:bg-[error]/20 transition-colors"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setConfirmRestore(null)}>
          <div className="glass glass-card p-8 max-w-sm w-11/12" onClick={(e) => e.stopPropagation()}>
            <div className="font-bold text-lg mb-2">Restaurar serviço?</div>
            <div className="text-slate-400 text-sm mb-6">O serviço será restaurado para o catálogo.</div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRestore(null)} className="flex-1 px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white font-medium text-sm hover:border-[rgba(148,163,184,0.2)] transition-colors">Cancelar</button>
              <button onClick={() => handleRestore(confirmRestore)} className="flex-1 px-3 py-2 rounded-lg bg-[primary] text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(136,206,17,0.4)] transition-all">Restaurar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete permanently modal */}
      {confirmDeletePerm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setConfirmDeletePerm(null)}>
          <div className="glass glass-card p-8 max-w-sm w-11/12" onClick={(e) => e.stopPropagation()}>
            <div className="font-bold text-lg mb-2">Deletar permanentemente?</div>
            <div className="text-slate-400 text-sm mb-6">Essa ação é irreversível. O serviço será deletado permanentemente.</div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeletePerm(null)} className="flex-1 px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white font-medium text-sm hover:border-[rgba(148,163,184,0.2)] transition-colors">Cancelar</button>
              <button onClick={() => handleDeletePermanently(confirmDeletePerm)} className="flex-1 px-3 py-2 rounded-lg bg-[error] text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all">Deletar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm empty trash modal */}
      {confirmEmptyTrash && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setConfirmEmptyTrash(false)}>
          <div className="glass glass-card p-8 max-w-sm w-11/12" onClick={(e) => e.stopPropagation()}>
            <div className="font-bold text-lg mb-2">Esvaziar lixeira?</div>
            <div className="text-slate-400 text-sm mb-6">Todos os serviços na lixeira serão deletados permanentemente. Essa ação é irreversível.</div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmEmptyTrash(false)} className="flex-1 px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white font-medium text-sm hover:border-[rgba(148,163,184,0.2)] transition-colors">Cancelar</button>
              <button onClick={handleEmptyTrash} className="flex-1 px-3 py-2 rounded-lg bg-[error] text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all">Esvaziar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
