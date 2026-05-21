"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Orcamento {
  id: string;
  data: string;
  cliente: string;
  template?: string;
  status: "rascunho" | "enviado" | "aprovado" | "rejeitado";
  precoFloor: number;
  precoPraticado: number;
  tagContexto?: string;
  multiplicador?: number;
}

interface Template {
  nome: string;
  usos: number;
  margemMedia: number;
  multiplicadorMedio: number;
  tendencia: "crescente" | "estavel" | "decrescente";
  alertaAtivo: boolean;
}

interface Alert {
  tipo: "warning" | "danger" | "success";
  mensagem: string;
}

// Mock data
const mockOrcamentos: Orcamento[] = [
  {
    id: "orc-001",
    data: "2026-05-15",
    cliente: "Exemplo Ltda",
    template: "Pacote Padrão",
    status: "aprovado",
    precoFloor: 1165.88,
    precoPraticado: 1850.0,
    tagContexto: "padrao",
    multiplicador: 1.59,
  },
  {
    id: "orc-002",
    data: "2026-05-14",
    cliente: "Startup XYZ",
    template: "Pacote Padrão",
    status: "enviado",
    precoFloor: 950.0,
    precoPraticado: 1420.0,
    tagContexto: "padrao",
    multiplicador: 1.49,
  },
  {
    id: "orc-003",
    data: "2026-05-10",
    cliente: "Premium Corp",
    template: "Pacote Premium",
    status: "aprovado",
    precoFloor: 2200.0,
    precoPraticado: 4100.0,
    tagContexto: "premium",
    multiplicador: 1.86,
  },
];

const mockTemplates: Template[] = [
  {
    nome: "Pacote Padrão",
    usos: 12,
    margemMedia: 45.0,
    multiplicadorMedio: 1.65,
    tendencia: "decrescente",
    alertaAtivo: true,
  },
  {
    nome: "Pacote Premium",
    usos: 8,
    margemMedia: 65.0,
    multiplicadorMedio: 1.85,
    tendencia: "crescente",
    alertaAtivo: false,
  },
  {
    nome: "Pacote Estratégico",
    usos: 3,
    margemMedia: 52.0,
    multiplicadorMedio: 1.72,
    tendencia: "estavel",
    alertaAtivo: false,
  },
];

const chartData = [
  { mes: "Jan", margem: 38.5 },
  { mes: "Fev", margem: 40.2 },
  { mes: "Mar", margem: 42.1 },
  { mes: "Abr", margem: 41.8 },
  { mes: "Mai", margem: 42.3 },
];

export default function AuditoriaPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [alertas, setAlertas] = useState<Alert[]>([]);
  const [periodo, setPeriodo] = useState("todos");
  const [templateFiltro, setTemplateFiltro] = useState("todos");

  useEffect(() => {
    setOrcamentos(mockOrcamentos);
    setTemplates(mockTemplates);

    const novasAlertas: Alert[] = [];
    mockTemplates.forEach((t) => {
      if (t.tendencia === "decrescente") {
        novasAlertas.push({
          tipo: "warning",
          mensagem: `🟡 Template "${t.nome}" com margem decrescente — considere revisão`,
        });
      }
    });

    novasAlertas.push({
      tipo: "success",
      mensagem: "🟢 Tag Premium com margem 18% acima da Padrão — segmentação está funcionando",
    });

    setAlertas(novasAlertas);
  }, []);

  const totalFechado = orcamentos
    .filter((o) => o.status === "aprovado")
    .reduce((sum, o) => sum + o.precoPraticado, 0);

  const totalOrcamentos = orcamentos.length;
  const mediaOrcamento = totalFechado / (orcamentos.filter((o) => o.status === "aprovado").length || 1);

  const margenTotal = orcamentos
    .filter((o) => o.status === "aprovado")
    .reduce((sum, o) => sum + ((o.precoPraticado - o.precoFloor) / o.precoFloor) * 100, 0);
  const margemMedia = margenTotal / (orcamentos.filter((o) => o.status === "aprovado").length || 1);

  const multiplicadorMedio =
    orcamentos
      .filter((o) => o.status === "aprovado")
      .reduce((sum, o) => sum + (o.multiplicador || 1), 0) /
    (orcamentos.filter((o) => o.status === "aprovado").length || 1);

  const handleExportCSV = () => {
    const csv = [
      ["Data", "Cliente", "Template", "Floor", "Praticado", "Multiplicador", "Margem %", "Status"],
      ...orcamentos.map((o) => {
        const margem = ((o.precoPraticado - o.precoFloor) / o.precoFloor) * 100;
        return [
          o.data,
          o.cliente,
          o.template || "-",
          `R$ ${o.precoFloor.toFixed(2)}`,
          `R$ ${o.precoPraticado.toFixed(2)}`,
          (o.multiplicador || 1).toFixed(2),
          margem.toFixed(1),
          o.status,
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "auditoria_orcamentos.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gama-bg via-gama-surface to-gama-surface-2 relative overflow-hidden">
      {/* Volumetric background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/orcamentos" className="inline-flex items-center gap-2 text-slate-400 hover:text-gama-primary transition-colors mb-4">
                  <span>←</span>
                  <span>Voltar</span>
                </Link>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gama-primary to-gama-primary bg-clip-text text-transparent">
                  📊 Auditoria de Orçamentos
                </h1>
                <p className="text-slate-400 text-sm mt-2">Análise de performance, margem e tendências</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Alertas */}
          {alertas.length > 0 && (
            <div className="space-y-3 mb-12">
              {alertas.map((alerta, idx) => (
                <div
                  key={idx}
                  className={`glass glass-card p-4 border-l-4 ${
                    alerta.tipo === "danger"
                      ? "border-gama-error bg-gama-error/10 text-gama-error"
                      : alerta.tipo === "warning"
                        ? "border-gama-warning bg-gama-warning/10 text-gama-warning"
                        : "border-gama-success bg-gama-success/10 text-gama-success"
                  } text-sm font-medium`}
                >
                  {alerta.mensagem}
                </div>
              ))}
            </div>
          )}

          {/* Resumo Executivo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)]">
              <p className="text-slate-400 text-xs uppercase mb-2">Total Fechado</p>
              <p className="text-3xl font-bold text-gama-primary">R$ {totalFechado.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-2">{orcamentos.filter((o) => o.status === "aprovado").length} orçamentos</p>
            </div>

            <div className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)]">
              <p className="text-slate-400 text-xs uppercase mb-2">Média por Orçamento</p>
              <p className="text-3xl font-bold text-white">R$ {mediaOrcamento.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-2">Entre fechados</p>
            </div>

            <div className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)]">
              <p className="text-slate-400 text-xs uppercase mb-2">Margem Média</p>
              <p className="text-3xl font-bold text-gama-primary">{margemMedia.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-2">Alvo: 35%</p>
            </div>

            <div className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)]">
              <p className="text-slate-400 text-xs uppercase mb-2">Multiplicador Médio</p>
              <p className="text-3xl font-bold text-white">{multiplicadorMedio.toFixed(2)}x</p>
              <p className="text-xs text-slate-500 mt-2">Sobre o floor</p>
            </div>
          </div>

          {/* Gráfico de Evolução */}
          <div className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)] mb-12 rounded-lg">
            <div className="mb-6">
              <p className="text-lg font-bold text-white">Evolução da Margem</p>
              <p className="text-sm text-slate-400">Últimos 5 meses</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="mes" stroke="rgba(148,163,184,0.6)" />
                <YAxis stroke="rgba(148,163,184,0.6)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(5,12,26,0.9)",
                    border: "1px solid rgba(136,206,17,0.3)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#88CE11" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="margem"
                  stroke="#88CE11"
                  strokeWidth={3}
                  dot={{ fill: "#88CE11", r: 6 }}
                  name="Margem %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Templates */}
          <div className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)] mb-12 rounded-lg">
            <div className="mb-6">
              <p className="text-lg font-bold text-white">Performance por Template</p>
              <p className="text-sm text-slate-400">{templates.length} templates em uso</p>
            </div>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.nome} className="p-4 border border-[rgba(148,163,184,0.1)] rounded-lg hover:border-gama-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-white">{template.nome}</p>
                      <p className="text-xs text-slate-400">{template.usos} usos</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        template.tendencia === "crescente"
                          ? "bg-gama-success/20 text-gama-success"
                          : template.tendencia === "decrescente"
                            ? "bg-gama-error/20 text-gama-error"
                            : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {template.tendencia === "crescente" ? "📈" : template.tendencia === "decrescente" ? "📉" : "➡️"} {template.tendencia}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Margem Média</p>
                      <p className="text-lg font-semibold text-white">{template.margemMedia.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Multiplicador Médio</p>
                      <p className="text-lg font-semibold text-gama-primary">{template.multiplicadorMedio.toFixed(2)}x</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabela de Orçamentos */}
          <div className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)] rounded-lg">
            <div className="mb-6">
              <p className="text-lg font-bold text-white">Todos os Orçamentos</p>
              <p className="text-sm text-slate-400">{orcamentos.length} orçamentos</p>
            </div>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(148,163,184,0.1)]">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Template</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Floor</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Praticado</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Multi.</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Margem</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-300 uppercase text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orcamentos.map((orc) => {
                    const margem = ((orc.precoPraticado - orc.precoFloor) / orc.precoFloor) * 100;
                    return (
                      <tr key={orc.id} className="border-b border-[rgba(148,163,184,0.05)] hover:bg-[rgba(148,163,184,0.05)] transition-colors">
                        <td className="py-4 px-4 text-xs text-slate-400">{orc.data}</td>
                        <td className="py-4 px-4 font-medium text-white">{orc.cliente}</td>
                        <td className="py-4 px-4 text-xs text-slate-400">{orc.template || "-"}</td>
                        <td className="py-4 px-4 text-right text-xs text-slate-300">R$ {orc.precoFloor.toFixed(2)}</td>
                        <td className="py-4 px-4 text-right font-semibold text-white">R$ {orc.precoPraticado.toFixed(2)}</td>
                        <td className="py-4 px-4 text-center text-xs text-slate-300">{(orc.multiplicador || 1).toFixed(2)}x</td>
                        <td className="py-4 px-4 text-center text-xs font-semibold text-gama-primary">{margem.toFixed(1)}%</td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              orc.status === "aprovado"
                                ? "bg-gama-success/20 text-gama-success"
                                : orc.status === "enviado"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-slate-500/20 text-slate-300"
                            }`}
                          >
                            {orc.status === "aprovado" ? "✅" : orc.status === "enviado" ? "📨" : "📋"} {orc.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleExportCSV}
              className="w-full px-4 py-3 bg-gama-primary text-black font-bold rounded-lg hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
