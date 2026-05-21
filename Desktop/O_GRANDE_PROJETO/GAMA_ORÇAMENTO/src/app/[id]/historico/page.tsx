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
      <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] flex items-center justify-center text-slate-400">
        Carregando...
      </div>
    );
  }

  if (!history || history.versoes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2]">
        <div className="no-print border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)] px-6 flex items-center justify-between h-14">
          <a href={`/${id}/preview`} className="text-slate-500 hover:text-slate-300 transition-colors text-lg">←</a>
          <h1 className="text-base font-bold m-0">Histórico de Versões</h1>
          <div className="w-5" />
        </div>
        <div className="p-6 text-center text-slate-400">
          <p>Este orçamento ainda não tem histórico de versões.</p>
        </div>
      </div>
    );
  }

  const sortedVersions = [...history.versoes].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2]">
      <div className="no-print border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)] px-6 flex items-center justify-between h-14">
        <a href={`/${id}/preview`} className="text-slate-500 hover:text-slate-300 transition-colors text-lg">←</a>
        <h1 className="text-base font-bold m-0">Histórico de Versões</h1>
        {history.versoes.length >= 2 && (
          <button
            onClick={handleCompare}
            className="px-4 py-2 rounded-lg border-none bg-[primary] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(136,206,17,0.4)] transition-all"
          >
            🔄 Comparar Últimas
          </button>
        )}
      </div>

      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex flex-col gap-3">
          {sortedVersions.map((version, idx) => {
            const subtotal = version.orcamento.itens.reduce((s, i) => s + i.total, 0);
            const desconto = version.orcamento.desconto_percentual > 0 ? subtotal * (version.orcamento.desconto_percentual / 100) : 0;
            const total = subtotal - desconto;
            const date = new Date(version.criado_em);

            return (
              <div
                key={version.id}
                className="glass glass-card p-4 cursor-pointer hover:border-[primary]/50 transition-all"
                onClick={() => handleViewVersion(version.versao_numero)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-sm text-white">
                      Versão #{version.versao_numero}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {date.toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-base text-[primary]">
                      {fmt(total)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {version.orcamento.itens.length} itens
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 pt-2 border-t border-[rgba(148,163,184,0.1)]">
                  <span className="text-slate-500 mr-2">Motivo:</span>
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
