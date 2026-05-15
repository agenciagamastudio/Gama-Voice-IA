"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAll, getTrash } from "@/lib/storage";
import type { Orcamento } from "@/types/orcamento";

export default function DebugPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [trash, setTrash] = useState<Orcamento[]>([]);
  const [rawData, setRawData] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orc = getAll();
      const t = getTrash();
      setOrcamentos(orc);
      setTrash(t);

      // Get raw localStorage data
      const raw = localStorage.getItem("gama_orcamentos") || "[]";
      setRawData(raw);
    }
  }, []);

  const handleClearAll = () => {
    if (confirm("⚠️ Limpar TODOS os dados de localStorage?")) {
      localStorage.clear();
      setOrcamentos([]);
      setTrash([]);
      setRawData("[]");
      alert("✅ localStorage limpo");
    }
  };

  const handleRestoreSample = () => {
    const sample = [
      {
        id: "sample-001",
        numero: "001",
        cliente: { nome: "Cliente Teste", cpf_cnpj: "123.456.789-00", email: "teste@email.com", telefone: "(11) 99999-9999" },
        datas: { emissao: "2026-05-13", validade: "2026-06-13" },
        itens: [
          { id: "1", descricao: "Design de Logo", quantidade: 1, preco_unitario: 500, total: 500 },
          { id: "2", descricao: "Cartão de Visita (500 un)", quantidade: 1, preco_unitario: 150, total: 150 },
        ],
        desconto_percentual: 10,
        status: "Pendente",
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      },
    ];
    localStorage.setItem("gama_orcamentos", JSON.stringify(sample));
    window.location.reload();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>🔍 Debug - localStorage</h1>
          <Link href="/" style={{ padding: "10px 20px", borderRadius: "var(--radius-sm)", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800 }}>
            ← Voltar
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          <div style={{ padding: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--primary)" }}>{orcamentos.length}</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>Orçamentos</div>
          </div>
          <div style={{ padding: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--primary)" }}>{trash.length}</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>Na Lixeira</div>
          </div>
          <div style={{ padding: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--primary)" }}>{rawData.length}</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>Bytes localStorage</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
          <button
            onClick={handleRestoreSample}
            style={{ padding: "10px 20px", borderRadius: "var(--radius-sm)", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, border: "none", cursor: "pointer" }}
          >
            ➕ Restaurar Orçamento de Exemplo
          </button>
          <button
            onClick={handleClearAll}
            style={{ padding: "10px 20px", borderRadius: "var(--radius-sm)", border: "1px solid var(--error)", background: "transparent", color: "var(--error)", fontWeight: 800, cursor: "pointer" }}
          >
            🗑️ Limpar localStorage
          </button>
        </div>

        {/* Orçamentos List */}
        {orcamentos.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>📋 Orçamentos ({orcamentos.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {orcamentos.map((orc) => (
                <div key={orc.id} style={{ padding: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    #{orc.numero} - {orc.cliente.nome}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                    ID: {orc.id} | Status: {orc.status} | Items: {orc.itens.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trash List */}
        {trash.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🗑️ Lixeira ({trash.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {trash.map((orc) => (
                <div key={orc.id} style={{ padding: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", opacity: 0.6 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    #{orc.numero} - {orc.cliente.nome}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                    ID: {orc.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw JSON */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>📄 Raw localStorage (gama_orcamentos)</h2>
          <pre style={{
            padding: 16,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "auto",
            maxHeight: 400,
            fontSize: 11,
            color: "var(--text-2)",
            fontFamily: "monospace"
          }}>
            {rawData}
          </pre>
        </div>
      </div>
    </div>
  );
}
