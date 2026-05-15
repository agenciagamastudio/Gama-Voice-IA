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
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="no-print" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <a href={`/${id}/historico`} style={{ color: "var(--text-3)", fontSize: 18 }}>←</a>
        <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Comparar Versões</h1>
        <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
          🖨 Imprimir
        </button>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Resumo de Diferenças */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, marginBottom: 32 }}>
          {/* Versão 1 */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8 }}>Versão #{version1.versao_numero}</div>
            <div style={{ fontWeight: 900, fontSize: 24, color: "var(--primary)", marginBottom: 4 }}>{fmt(total1)}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>{date1.toLocaleDateString("pt-BR")}</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              {orc1.itens.length} itens
            </div>
          </div>

          {/* Diferença */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8 }}>Diferença</div>
            <div style={{ fontWeight: 900, fontSize: 24, color: difference > 0 ? "#10b981" : "#ef4444" }}>
              {difference > 0 ? "+" : ""}{fmt(difference)}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>
              {differencePercent > 0 ? "+" : ""}{differencePercent}%
            </div>
          </div>

          {/* Versão 2 */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8 }}>Versão #{version2.versao_numero}</div>
            <div style={{ fontWeight: 900, fontSize: 24, color: "var(--primary)", marginBottom: 4 }}>{fmt(total2)}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>{date2.toLocaleDateString("pt-BR")}</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              {orc2.itens.length} itens
            </div>
          </div>
        </div>

        {/* Tabela de Itens */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "var(--text-2)" }}>Item</th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "var(--text-2)" }}>V{version1.versao_numero}</th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "var(--text-2)" }}>V{version2.versao_numero}</th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "var(--text-2)" }}>Diferença</th>
              </tr>
            </thead>
            <tbody>
              {orc2.itens.map((item2, idx) => {
                const item1 = orc1.itens.find((i) => i.id === item2.id);
                const diff = item2.total - (item1?.total ?? 0);
                const isChanged = diff !== 0;

                return (
                  <tr key={item2.id} style={{ borderBottom: "1px solid var(--border)", background: isChanged ? "var(--bg)" : "transparent" }}>
                    <td style={{ padding: "12px", color: "var(--text-1)" }}>{item2.descricao}</td>
                    <td style={{ padding: "12px", textAlign: "right", color: "var(--text-2)" }}>
                      {item1 ? fmt(item1.total) : "-"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "var(--text-1)", fontWeight: isChanged ? 600 : 400 }}>
                      {fmt(item2.total)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: diff > 0 ? "#10b981" : diff < 0 ? "#ef4444" : "var(--text-3)", fontWeight: 600 }}>
                      {diff > 0 ? "+" : ""}{fmt(diff)}
                    </td>
                  </tr>
                );
              })}

              {/* Itens removidos da versão anterior */}
              {orc1.itens.filter((i) => !orc2.itens.find((i2) => i2.id === i.id)).map((item1) => (
                <tr key={`removed-${item1.id}`} style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                  <td style={{ padding: "12px", color: "var(--text-2)" }}>
                    <span style={{ textDecoration: "line-through" }}>{item1.descricao}</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", color: "var(--text-2)" }}>
                    {fmt(item1.total)}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", color: "var(--text-3)" }}>-</td>
                  <td style={{ padding: "12px", textAlign: "right", color: "#ef4444", fontWeight: 600 }}>
                    {fmt(-item1.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo Final */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "var(--text-2)" }}>Subtotal:</span>
              <span style={{ color: "var(--text-1)" }}>{fmt(subtotal1)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "var(--text-2)" }}>Desconto:</span>
              <span style={{ color: "#ef4444" }}>-{fmt(desconto1)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border)", fontWeight: 700 }}>
              <span>Total:</span>
              <span style={{ fontSize: 16, color: "var(--primary)" }}>{fmt(total1)}</span>
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "var(--text-2)" }}>Subtotal:</span>
              <span style={{ color: "var(--text-1)" }}>{fmt(subtotal2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "var(--text-2)" }}>Desconto:</span>
              <span style={{ color: "#ef4444" }}>-{fmt(desconto2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border)", fontWeight: 700 }}>
              <span>Total:</span>
              <span style={{ fontSize: 16, color: "var(--primary)" }}>{fmt(total2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
