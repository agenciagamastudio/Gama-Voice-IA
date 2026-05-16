"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
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
    // Carregar mock data
    setOrcamentos(mockOrcamentos);
    setTemplates(mockTemplates);

    // Gerar alertas
    const novasAlertas: Alert[] = [];

    // Alertas de templates
    mockTemplates.forEach((t) => {
      if (t.tendencia === "decrescente") {
        novasAlertas.push({
          tipo: "warning",
          mensagem: `🟡 Template "${t.nome}" com margem decrescente — considere revisão`,
        });
      }
    });

    // Alerta de tag premium
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
    <div className="container py-8">
      {/* Back button */}
      <div className="mb-8">
        <Link href="/orcamentos">
          <Button variant="ghost">← Voltar</Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">📊 Auditoria de Orçamentos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Análise de performance, margem e tendências</p>
      </div>

      {/* Alertas */}
      <div className="mb-8 space-y-2">
        {alertas.map((alerta, idx) => (
          <div
            key={idx}
            className={`p-3 rounded border ${
              alerta.tipo === "warning"
                ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200"
                : alerta.tipo === "danger"
                  ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
                  : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200"
            }`}
          >
            {alerta.mensagem}
          </div>
        ))}
      </div>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Fechado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {totalFechado.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{orcamentos.filter((o) => o.status === "aprovado").length} orçamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Média por Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {mediaOrcamento.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Entre fechados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Margem Média</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{margemMedia.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Alvo: 35%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Multiplicador Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{multiplicadorMedio.toFixed(2)}x</p>
            <p className="text-xs text-gray-500 mt-1">Sobre o floor</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Evolução da Margem</CardTitle>
          <CardDescription>Últimos 5 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" stroke="var(--text-3)" />
              <YAxis stroke="var(--text-3)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="margem"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)" }}
                name="Margem %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance por Template</CardTitle>
          <CardDescription>{templates.length} templates em uso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.map((template) => (
            <div key={template.nome} className="p-4 border rounded-lg dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{template.nome}</p>
                  <p className="text-xs text-gray-500">{template.usos} usos</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    template.tendencia === "crescente"
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : template.tendencia === "decrescente"
                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        : "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {template.tendencia === "crescente" ? "📈" : template.tendencia === "decrescente" ? "📉" : "➡️"}{" "}
                  {template.tendencia}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Margem Média</p>
                  <p className="font-semibold">{template.margemMedia.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Multiplicador Médio</p>
                  <p className="font-semibold">{template.multiplicadorMedio.toFixed(2)}x</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tabela de Orçamentos */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Todos os Orçamentos</CardTitle>
          <CardDescription>{orcamentos.length} orçamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="text-left py-3 px-2 font-semibold">Data</th>
                  <th className="text-left py-3 px-2 font-semibold">Cliente</th>
                  <th className="text-left py-3 px-2 font-semibold">Template</th>
                  <th className="text-right py-3 px-2 font-semibold">Floor</th>
                  <th className="text-right py-3 px-2 font-semibold">Praticado</th>
                  <th className="text-center py-3 px-2 font-semibold">Multi.</th>
                  <th className="text-center py-3 px-2 font-semibold">Margem</th>
                  <th className="text-center py-3 px-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orcamentos.map((orc) => {
                  const margem = ((orc.precoPraticado - orc.precoFloor) / orc.precoFloor) * 100;
                  return (
                    <tr key={orc.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-2 text-xs">{orc.data}</td>
                      <td className="py-3 px-2 font-medium">{orc.cliente}</td>
                      <td className="py-3 px-2 text-xs text-gray-600 dark:text-gray-400">{orc.template || "-"}</td>
                      <td className="py-3 px-2 text-right text-xs">R$ {orc.precoFloor.toFixed(2)}</td>
                      <td className="py-3 px-2 text-right font-semibold">R$ {orc.precoPraticado.toFixed(2)}</td>
                      <td className="py-3 px-2 text-center text-xs">{(orc.multiplicador || 1).toFixed(2)}x</td>
                      <td className="py-3 px-2 text-center text-xs font-semibold">{margem.toFixed(1)}%</td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            orc.status === "aprovado"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : orc.status === "enviado"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {orc.status === "aprovado" ? "✅" : orc.status === "enviado" ? "📨" : "📋"}{" "}
                          {orc.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Button onClick={handleExportCSV} className="w-full">
            📥 Exportar CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
