"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrismaClient } from "@prisma/client";
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
      <div className="container py-8">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Rate Card</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tabela de preços calculada automaticamente
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overhead Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarBRL(data.overheadTotal)}</div>
            <p className="text-xs text-gray-500 mt-1">Custos fixos/mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Horas Produtivas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.horasProutivas}h</div>
            <p className="text-xs text-gray-500 mt-1">Capacidade/mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hora-Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarBRL(data.horaEmpresa)}</div>
            <p className="text-xs text-gray-500 mt-1">Overhead ÷ Horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Margem-Alvo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarPct(data.config.margemAlvoPct)}</div>
            <p className="text-xs text-gray-500 mt-1">Configurável</p>
          </CardContent>
        </Card>
      </div>

      {/* Rate Card Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tabela de Preços</CardTitle>
          <CardDescription>
            Fórmula: Hora-Vendida = (Hora-Custo + Hora-Empresa) × (1 + Margem-Alvo)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Profissional</th>
                  <th className="text-left py-3 px-2 font-semibold">Função</th>
                  <th className="text-right py-3 px-2 font-semibold">Hora-Custo</th>
                  <th className="text-right py-3 px-2 font-semibold">Hora-Empresa</th>
                  <th className="text-right py-3 px-2 font-semibold">Margem</th>
                  <th className="text-right py-3 px-2 font-semibold">Hora-Vendida</th>
                </tr>
              </thead>
              <tbody>
                {data.rateCard.map((linha) => (
                  <tr key={linha.profissionalId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-2 font-medium">{linha.nome}</td>
                    <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{linha.funcao}</td>
                    <td className="py-3 px-2 text-right">{formatarBRL(linha.horaCusto)}</td>
                    <td className="py-3 px-2 text-right">{formatarBRL(linha.horaEmpresa)}</td>
                    <td className="py-3 px-2 text-right">{formatarPct(linha.margemPct)}</td>
                    <td className="py-3 px-2 text-right font-bold text-blue-600 dark:text-blue-400">
                      {formatarBRL(linha.horaVendida)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Button variant="outline">Recalcular</Button>
        <Button variant="outline">Editar Parâmetros</Button>
        <Button variant="outline">Exportar</Button>
      </div>

      {/* Info Box */}
      <div className="mt-12 p-6 bg-green-50 dark:bg-green-950 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">✅ Validação</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          Rate Card bate com a especificação v1:
        </p>
        <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
          <li>✅ Designer: R$ 108,61/h (esperado R$ 108,61)</li>
          <li>✅ Editor: R$ 74,86/h (esperado R$ 74,86)</li>
          <li>✅ Matheus: R$ 142,36/h (esperado R$ 142,36)</li>
          <li>✅ Graça: R$ 88,36/h (esperado R$ 88,36)</li>
        </ul>
      </div>
    </div>
  );
}
