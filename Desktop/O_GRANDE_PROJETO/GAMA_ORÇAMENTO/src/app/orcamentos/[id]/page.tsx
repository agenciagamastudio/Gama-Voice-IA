"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Copy, Download, Send, Save } from "lucide-react";

const mockOrcamento = {
  id: "orc-001",
  cliente: "Exemplo Ltda",
  data: "2026-05-15",
  status: "rascunho" as const,
  itens: [
    { id: "1", nome: "Post Estático", quantidade: 4, precoFloor: 36.20, profissional: "Designer" },
    { id: "2", nome: "Reels", quantidade: 2, precoFloor: 18.72, profissional: "Editor" },
  ],
  precoFloor: 181.28,
  precoPraticado: 1850.00,
  markup: 59,
  tagContexto: "padrao",
  multiplicador: 1.59,
};

const statusConfig = {
  rascunho: { color: "text-slate-400", bg: "bg-slate-500/20", label: "Rascunho" },
  enviado: { color: "text-blue-400", bg: "bg-blue-500/20", label: "Enviado" },
  aprovado: { color: "text-green-400", bg: "bg-green-500/20", label: "Aprovado" },
  rejeitado: { color: "text-red-400", bg: "bg-red-500/20", label: "Rejeitado" },
};

export default function OrcamentoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [orcamento] = useState(mockOrcamento);
  const [precoPraticado, setPrecoPraticado] = useState(orcamento.precoPraticado);

  const margem = precoPraticado - orcamento.precoFloor;
  const margemPercent = (margem / orcamento.precoFloor) * 100;
  const margemAlerta = precoPraticado < orcamento.precoFloor;

  const handleDuplicar = () => {
    const novoOrcamento = {
      ...orcamento,
      id: `orc-${Date.now()}`,
      data: new Date().toISOString().split("T")[0],
      status: "rascunho" as const,
    };

    sessionStorage.setItem("orcamentoEmEdicao", JSON.stringify({
      clienteId: orcamento.cliente,
      tagContexto: orcamento.tagContexto,
      itens: orcamento.itens.map((i) => ({
        entregavelId: i.id,
        quantidade: i.quantidade,
        precoFloor: i.precoFloor,
      })),
      precoFloorTotal: orcamento.precoFloor,
    }));

    router.push("/orcamentos/novo");
  };

  const config = statusConfig[orcamento.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gama-bg via-gama-surface to-gama-surface-2 relative overflow-hidden">
      {/* Volumetric background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/orcamentos">
                <button className="p-2 hover:bg-[rgba(148,163,184,0.1)] rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
                </button>
              </Link>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-bold text-white">{orcamento.cliente}</h1>
                <p className="text-slate-400 mt-2">
                  Orçamento <span className="text-gama-primary font-mono">#{orcamento.id}</span> • {new Date(orcamento.data).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${config.bg} ${config.color}`}>
                {config.label}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Items Table */}
            <div className="lg:col-span-2">
              <div className="glass glass-card p-6">
                <h2 className="text-2xl font-bold text-white mb-1">Itens do Orçamento</h2>
                <p className="text-slate-400 mb-6">{orcamento.itens.length} entregável(is) • Tag: <span className="capitalize text-gama-primary">{orcamento.tagContexto}</span></p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(148,163,184,0.1)]">
                        <th className="text-left py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Entregável</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Profissional</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Qtd</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Unit.</th>
                        <th className="text-right py-3 px-4 font-semibold text-gama-primary uppercase text-xs">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orcamento.itens.map((item) => (
                        <tr key={item.id} className="border-b border-[rgba(148,163,184,0.05)] hover:bg-[rgba(148,163,184,0.05)] transition-colors">
                          <td className="py-4 px-4 font-medium text-white">{item.nome}</td>
                          <td className="py-4 px-4 text-center text-xs text-slate-400">{item.profissional}</td>
                          <td className="py-4 px-4 text-right text-slate-300">{item.quantidade}</td>
                          <td className="py-4 px-4 text-right text-slate-300">R$ {item.precoFloor.toFixed(2)}</td>
                          <td className="py-4 px-4 text-right font-semibold text-gama-primary">
                            R$ {(item.precoFloor * item.quantidade).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Summary & Actions */}
            <div className="space-y-6">
              {/* Price Comparison */}
              <div className="glass glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4">Comparativo de Preços</h3>

                <div className="space-y-3">
                  <div className="bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] rounded-lg p-4">
                    <p className="text-xs uppercase text-slate-400 mb-1">Floor (Mínimo)</p>
                    <p className="text-2xl font-bold text-white">R$ {orcamento.precoFloor.toFixed(2)}</p>
                  </div>

                  <div className="bg-gama-primary/10 border border-gama-primary/30 rounded-lg p-4">
                    <p className="text-xs uppercase text-slate-400 mb-1">Praticado</p>
                    <p className="text-2xl font-bold text-gama-primary">R$ {precoPraticado.toFixed(2)}</p>
                  </div>

                  <div className={`rounded-lg p-4 border ${
                    margemAlerta
                      ? "bg-[error]/10 border-[error]/30"
                      : "bg-[success]/10 border-[success]/30"
                  }`}>
                    <p className="text-xs uppercase text-slate-400 mb-1">Margem</p>
                    <p className={`text-2xl font-bold ${margemAlerta ? "text-[error]" : "text-[success]"}`}>
                      {margemAlerta ? "⚠️" : "✅"} R$ {margem.toFixed(2)} ({margemPercent.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Adjustment */}
              <div className="glass glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4">Ajustar Preço</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase text-slate-400 block mb-2">Preço (R$)</label>
                    <input
                      type="number"
                      value={precoPraticado}
                      onChange={(e) => setPrecoPraticado(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-[rgba(136,206,17,0.1)] border border-gama-primary/30 rounded-lg text-gama-primary font-semibold placeholder-slate-500 focus:outline-none focus:border-gama-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-slate-400 block mb-2">Multiplicador</label>
                    <p className="text-2xl font-bold text-gama-primary">
                      {(precoPraticado / orcamento.precoFloor).toFixed(2)}x
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="glass glass-card p-6">
                <div className="space-y-2">
                  <button className="w-full px-4 py-3 bg-gama-primary text-black font-bold rounded-lg hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </button>
                  <button className="w-full px-4 py-3 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] text-slate-300 font-medium rounded-lg hover:border-gama-primary/50 transition-colors flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Exportar PDF
                  </button>
                  <button className="w-full px-4 py-3 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] text-slate-300 font-medium rounded-lg hover:border-gama-primary/50 transition-colors flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Enviar para Cliente
                  </button>
                  <button
                    onClick={handleDuplicar}
                    className="w-full px-4 py-3 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] text-slate-300 font-medium rounded-lg hover:border-gama-primary/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-5 h-5" />
                    Duplicar Orçamento
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="glass glass-card p-6 border-l-2 border-blue-500/50">
                <h4 className="text-sm font-bold text-white mb-4">Informações</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400 uppercase text-xs mb-1">Cliente</p>
                    <p className="text-white font-medium">{orcamento.cliente}</p>
                  </div>
                  <div className="border-t border-[rgba(148,163,184,0.1)] pt-3">
                    <p className="text-slate-400 uppercase text-xs mb-1">Tag Contexto</p>
                    <p className="text-gama-primary font-medium capitalize">{orcamento.tagContexto}</p>
                  </div>
                  <div className="border-t border-[rgba(148,163,184,0.1)] pt-3">
                    <p className="text-slate-400 uppercase text-xs mb-1">Data de Criação</p>
                    <p className="text-white font-medium">{new Date(orcamento.data).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
