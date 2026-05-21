"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getVersion } from "@/lib/storage";
import { fmt } from "@/lib/utils";
import type { OrcamentoVersion } from "@/types/orcamento";

export default function CompararPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const v1Str = searchParams.get("v1");
  const v2Str = searchParams.get("v2");

  const [version1, setVersion1] = useState<OrcamentoVersion | null>(null);
  const [version2, setVersion2] = useState<OrcamentoVersion | null>(null);

  useEffect(() => {
    if (!v1Str || !v2Str) {
      router.push(`/${id}/historico`);
      return;
    }

    const v1Num = parseInt(v1Str, 10);
    const v2Num = parseInt(v2Str, 10);

    const found1 = getVersion(id, v1Num);
    const found2 = getVersion(id, v2Num);

    if (!found1 || !found2) {
      router.push(`/${id}/historico`);
      return;
    }

    setVersion1(found1);
    setVersion2(found2);
  }, [id, v1Str, v2Str, router]);

  if (!version1 || !version2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] flex items-center justify-center text-slate-400">
        Carregando...
      </div>
    );
  }

  const orc1 = version1.orcamento;
  const orc2 = version2.orcamento;

  const subtotal1 = orc1.itens.reduce((s, i) => s + i.total, 0);
  const desconto1 = orc1.desconto_percentual > 0 ? subtotal1 * (orc1.desconto_percentual / 100) : 0;
  const total1 = subtotal1 - desconto1;

  const subtotal2 = orc2.itens.reduce((s, i) => s + i.total, 0);
  const desconto2 = orc2.desconto_percentual > 0 ? subtotal2 * (orc2.desconto_percentual / 100) : 0;
  const total2 = subtotal2 - desconto2;

  const difference = total2 - total1;
  const differencePercent = total1 > 0 ? ((difference / total1) * 100).toFixed(1) : 0;

  const date1 = new Date(version1.criado_em);
  const date2 = new Date(version2.criado_em);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2]">
      <div className="no-print border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)] px-6 flex items-center justify-between h-14">
        <a href={`/${id}/historico`} className="text-slate-500 hover:text-slate-300 transition-colors text-lg">←</a>
        <h1 className="text-base font-bold m-0">Comparar Versões</h1>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-1.5 rounded-lg border-none bg-[primary] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(136,206,17,0.4)] transition-all">
          🖨 Imprimir
        </button>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        {/* Resumo de Diferenças */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Versão 1 */}
          <div className="glass glass-card p-4">
            <div className="text-xs text-slate-400 mb-2">Versão #{version1.versao_numero}</div>
            <div className="font-black text-2xl text-[primary] mb-1">{fmt(total1)}</div>
            <div className="text-xs text-slate-500">{date1.toLocaleDateString("pt-BR")}</div>
            <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-[rgba(148,163,184,0.1)]">
              {orc1.itens.length} itens
            </div>
          </div>

          {/* Diferença */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-slate-400 mb-2">Diferença</div>
            <div className={`font-black text-2xl ${difference > 0 ? "text-[success]" : "text-[error]"}`}>
              {difference > 0 ? "+" : ""}{fmt(difference)}
            </div>
            <div className="text-xs text-slate-500">
              {differencePercent > 0 ? "+" : ""}{differencePercent}%
            </div>
          </div>

          {/* Versão 2 */}
          <div className="glass glass-card p-4">
            <div className="text-xs text-slate-400 mb-2">Versão #{version2.versao_numero}</div>
            <div className="font-black text-2xl text-[primary] mb-1">{fmt(total2)}</div>
            <div className="text-xs text-slate-500">{date2.toLocaleDateString("pt-BR")}</div>
            <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-[rgba(148,163,184,0.1)]">
              {orc2.itens.length} itens
            </div>
          </div>
        </div>

        {/* Tabela de Itens */}
        <div className="glass glass-card overflow-hidden mb-8">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[rgba(5,12,26,0.5)] border-b border-[rgba(148,163,184,0.1)]">
                <th className="p-3 text-left font-semibold text-slate-400">Item</th>
                <th className="p-3 text-right font-semibold text-slate-400">V{version1.versao_numero}</th>
                <th className="p-3 text-right font-semibold text-slate-400">V{version2.versao_numero}</th>
                <th className="p-3 text-right font-semibold text-slate-400">Diferença</th>
              </tr>
            </thead>
            <tbody>
              {orc2.itens.map((item2, idx) => {
                const item1 = orc1.itens.find((i) => i.id === item2.id);
                const diff = item2.total - (item1?.total ?? 0);
                const isChanged = diff !== 0;

                return (
                  <tr key={item2.id} className={`border-b border-[rgba(148,163,184,0.1)] ${isChanged ? "bg-[rgba(15,23,42,0.3)]" : ""}`}>
                    <td className="p-3 text-white">{item2.descricao}</td>
                    <td className="p-3 text-right text-slate-400">
                      {item1 ? fmt(item1.total) : "-"}
                    </td>
                    <td className={`p-3 text-right ${isChanged ? "font-semibold text-white" : "text-slate-400"}`}>
                      {fmt(item2.total)}
                    </td>
                    <td className={`p-3 text-right font-semibold ${diff > 0 ? "text-[success]" : diff < 0 ? "text-[error]" : "text-slate-500"}`}>
                      {diff > 0 ? "+" : ""}{fmt(diff)}
                    </td>
                  </tr>
                );
              })}

              {/* Itens removidos da versão anterior */}
              {orc1.itens.filter((i) => !orc2.itens.find((i2) => i2.id === i.id)).map((item1) => (
                <tr key={`removed-${item1.id}`} className="border-b border-[rgba(148,163,184,0.1)] bg-[rgba(15,23,42,0.3)]">
                  <td className="p-3 text-slate-400">
                    <span className="line-through">{item1.descricao}</span>
                  </td>
                  <td className="p-3 text-right text-slate-400">
                    {fmt(item1.total)}
                  </td>
                  <td className="p-3 text-right text-slate-500">-</td>
                  <td className="p-3 text-right text-[error] font-semibold">
                    {fmt(-item1.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo Final */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass glass-card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Subtotal:</span>
              <span className="text-white">{fmt(subtotal1)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Desconto:</span>
              <span className="text-[error]">-{fmt(desconto1)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[rgba(148,163,184,0.1)] font-bold">
              <span>Total:</span>
              <span className="text-base text-[primary]">{fmt(total1)}</span>
            </div>
          </div>

          <div className="glass glass-card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Subtotal:</span>
              <span className="text-white">{fmt(subtotal2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Desconto:</span>
              <span className="text-[error]">-{fmt(desconto2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[rgba(148,163,184,0.1)] font-bold">
              <span>Total:</span>
              <span className="text-base text-[primary]">{fmt(total2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
