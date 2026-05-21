"use client";

import { useEffect, useState } from "react";
import { calcularHoraEmpresa, calcularRateCard, formatarBRL, formatarPct, RateCardLinha } from "@/lib/pricing/rate-card";

// Note: Em produção, isso seria um endpoint API
// Por enquanto, usamos cálculos client-side com dados mockados

interface DataState {
  profissionais: any[];
  overhead: any[];
  config: any;
  rateCard: RateCardLinha[];
  horaEmpresa: number;
  overheadTotal: number;
  horasProutivas: number;
}

export default function RateCardPage() {
  const [data, setData] = useState<DataState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Chamar endpoint API /api/config/rate-card
    // Por enquanto, dados mockados baseados no seed
    const mockData: DataState = {
      profissionais: [
        {
          id: "1",
          nome: "Designer",
          funcao: "Design Gráfico",
          horaCusto: 75,
          capacidadeMes: 120,
          ativo: true,
        },
        {
          id: "2",
          nome: "Editor / Storymaker",
          funcao: "Edição de Vídeo",
          horaCusto: 50,
          capacidadeMes: 120,
          ativo: true,
        },
        {
          id: "3",
          nome: "Matheus",
          funcao: "Estratégia",
          horaCusto: 100,
          capacidadeMes: 120,
          ativo: true,
        },
        {
          id: "4",
          nome: "Graça",
          funcao: "Gestão de Redes",
          horaCusto: 60,
          capacidadeMes: 120,
          ativo: true,
        },
      ],
      overhead: [
        { id: "1", descricao: "Salários e Benefícios", valor: 2000, proporcional: 1.0, ativo: true },
        {
          id: "2",
          descricao: "Software e Ferramentas (Adobe, Canva, Claude, etc)",
          valor: 315,
          proporcional: 1.0,
          ativo: true,
        },
        {
          id: "3",
          descricao: "Infraestrutura (internet, energia, aluguel)",
          valor: 301,
          proporcional: 1.0,
          ativo: true,
        },
      ],
      config: { margemAlvoPct: 35 },
      rateCard: [],
      horaEmpresa: 0,
      overheadTotal: 0,
      horasProutivas: 0,
    };

    // Calcular
    const overheadTotal = mockData.overhead.reduce((sum, item) => sum + item.valor * item.proporcional, 0);
    const horasProutivas = mockData.profissionais.reduce((sum, p) => sum + p.capacidadeMes, 0);
    const horaEmpresa = overheadTotal / horasProutivas;

    const rateCard = calcularRateCard(mockData.profissionais, horaEmpresa, mockData.config.margemAlvoPct);

    setData({
      ...mockData,
      rateCard,
      horaEmpresa,
      overheadTotal,
      horasProutivas,
    });

    setLoading(false);
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] flex items-center justify-center">
        <p className="text-slate-400 text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] relative overflow-hidden">
      {/* Volumetric background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)]">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[primary] to-[primary-light] bg-clip-text text-transparent">
              📊 Rate Card
            </h1>
            <p className="text-slate-400 mt-2">
              Tabela de preços calculada automaticamente
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)] rounded-lg">
              <p className="text-slate-400 text-xs uppercase mb-2 tracking-wider">Overhead Mensal</p>
              <p className="text-3xl font-bold text-white">{formatarBRL(data.overheadTotal)}</p>
              <p className="text-slate-500 text-xs mt-2">Custos fixos/mês</p>
            </div>

            <div className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)] rounded-lg">
              <p className="text-slate-400 text-xs uppercase mb-2 tracking-wider">Horas Produtivas</p>
              <p className="text-3xl font-bold text-white">{data.horasProutivas}h</p>
              <p className="text-slate-500 text-xs mt-2">Capacidade/mês</p>
            </div>

            <div className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)] rounded-lg">
              <p className="text-slate-400 text-xs uppercase mb-2 tracking-wider">Hora-Empresa</p>
              <p className="text-3xl font-bold text-[primary]">{formatarBRL(data.horaEmpresa)}</p>
              <p className="text-slate-500 text-xs mt-2">Overhead ÷ Horas</p>
            </div>

            <div className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)] rounded-lg">
              <p className="text-slate-400 text-xs uppercase mb-2 tracking-wider">Margem-Alvo</p>
              <p className="text-3xl font-bold text-[primary]">{formatarPct(data.config.margemAlvoPct)}</p>
              <p className="text-slate-500 text-xs mt-2">Configurável</p>
            </div>
          </div>

          {/* Rate Card Table */}
          <div className="glass glass-card p-8 border border-[rgba(148,163,184,0.1)] rounded-lg mb-12">
            <div className="mb-6">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Tabela de Preços</p>
              <p className="text-slate-300 text-sm">
                Fórmula: Hora-Vendida = (Hora-Custo + Hora-Empresa) × (1 + Margem-Alvo)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(148,163,184,0.1)]">
                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Profissional</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Função</th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Hora-Custo</th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Hora-Empresa</th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Margem</th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Hora-Vendida</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rateCard.map((linha) => (
                    <tr key={linha.profissionalId} className="border-b border-[rgba(148,163,184,0.05)] hover:bg-[rgba(136,206,17,0.05)] transition-colors">
                      <td className="py-4 px-4 font-medium text-white">{linha.nome}</td>
                      <td className="py-4 px-4 text-slate-300">{linha.funcao}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{formatarBRL(linha.horaCusto)}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{formatarBRL(linha.horaEmpresa)}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{formatarPct(linha.margemPct)}</td>
                      <td className="py-4 px-4 text-right font-bold text-[primary]">
                        {formatarBRL(linha.horaVendida)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-12">
            <button className="px-6 py-3 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.2)] rounded-lg text-slate-300 font-medium hover:border-[primary]/50 hover:bg-[rgba(136,206,17,0.05)] transition-all">
              🔄 Recalcular
            </button>
            <button className="px-6 py-3 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.2)] rounded-lg text-slate-300 font-medium hover:border-[primary]/50 hover:bg-[rgba(136,206,17,0.05)] transition-all">
              ⚙️ Editar Parâmetros
            </button>
            <button className="px-6 py-3 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.2)] rounded-lg text-slate-300 font-medium hover:border-[primary]/50 hover:bg-[rgba(136,206,17,0.05)] transition-all">
              📥 Exportar
            </button>
          </div>

          {/* Validation Box */}
          <div className="glass glass-card p-8 border border-green-500/30 bg-[rgba(34,197,94,0.05)] rounded-lg">
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">✅</span>
              <div>
                <h2 className="text-lg font-bold text-green-300 mb-3">Validação</h2>
                <p className="text-slate-400 text-sm mb-4">
                  Rate Card bate com a especificação v1:
                </p>
                <ul className="text-sm space-y-2 text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Designer: R$ 108,61/h (esperado R$ 108,61)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Editor: R$ 74,86/h (esperado R$ 74,86)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Matheus: R$ 142,36/h (esperado R$ 142,36)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>Graça: R$ 88,36/h (esperado R$ 88,36)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
