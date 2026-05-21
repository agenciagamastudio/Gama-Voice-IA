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
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        <div className="border-b border-gama-border backdrop-blur-md bg-gama-surface/40">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gama-primary to-[primary-light] bg-clip-text text-transparent">🔍 Debug - localStorage</h1>
              <Link href="/" className="px-4 py-2 bg-gama-primary text-black font-bold rounded-lg hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] transition-all text-sm">
                ← Voltar
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="glass glass-card p-6">
              <div className="text-4xl font-black text-gama-primary">{orcamentos.length}</div>
              <div className="text-xs uppercase text-gama-text-secondary font-semibold mt-2">Orçamentos</div>
            </div>
            <div className="glass glass-card p-6">
              <div className="text-4xl font-black text-gama-primary">{trash.length}</div>
              <div className="text-xs uppercase text-gama-text-secondary font-semibold mt-2">Na Lixeira</div>
            </div>
            <div className="glass glass-card p-6">
              <div className="text-4xl font-black text-gama-primary">{rawData.length}</div>
              <div className="text-xs uppercase text-gama-text-secondary font-semibold mt-2">Bytes localStorage</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-12">
            <button
              onClick={handleRestoreSample}
              className="px-4 py-2 bg-gama-primary text-black font-bold rounded-lg hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] transition-all text-sm"
            >
              ➕ Restaurar Exemplo
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-[error]/10 border border-[error]/30 rounded-lg text-[error] text-sm font-medium hover:bg-[error]/20 transition-colors"
            >
              🗑️ Limpar localStorage
            </button>
          </div>

          {/* Orçamentos List */}
          {orcamentos.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-white mb-4">📋 Orçamentos ({orcamentos.length})</h2>
              <div className="space-y-3">
                {orcamentos.map((orc) => (
                  <div key={orc.id} className="glass glass-card p-4">
                    <div className="font-bold text-white mb-1">
                      #{orc.numero} - {orc.cliente.nome}
                    </div>
                    <div className="text-xs text-gama-text-secondary">
                      ID: {orc.id} | Status: {orc.status} | Items: {orc.itens.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trash List */}
          {trash.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-white mb-4">🗑️ Lixeira ({trash.length})</h2>
              <div className="space-y-3">
                {trash.map((orc) => (
                  <div key={orc.id} className="glass glass-card p-4 opacity-60">
                    <div className="font-bold text-white mb-1">
                      #{orc.numero} - {orc.cliente.nome}
                    </div>
                    <div className="text-xs text-gama-text-secondary">
                      ID: {orc.id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">📄 Raw localStorage (gama_orcamentos)</h2>
            <div className="glass glass-card p-4">
              <pre className="text-xs text-gama-text font-mono overflow-auto max-h-96">
                {rawData}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
