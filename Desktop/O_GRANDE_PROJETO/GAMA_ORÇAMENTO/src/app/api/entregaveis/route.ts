import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calcularPrecoFloorEntregavel, minutosParaHoras } from "@/lib/pricing/entregaveis";
import { calcularRateCard } from "@/lib/pricing/rate-card";

const prisma = new PrismaClient();

// GET /api/entregaveis - Listar todos os entregáveis com preço floor calculado
export async function GET() {
  try {
    // 1. Buscar todos os entregáveis ativos
    const entregaveis = await prisma.entregavelCatalogo.findMany({
      where: { ativo: true },
      include: { profissional: true },
    });

    // 2. Buscar config e profissionais para calcular rate card
    const config = await prisma.configAgencia.findFirst();
    const profissionais = await prisma.profissional.findMany({ where: { ativo: true } });

    if (!config || profissionais.length === 0) {
      return NextResponse.json({ error: "Configuração ou profissionais não encontrados" }, { status: 400 });
    }

    // 3. Calcular rate card
    const overheadItems = await prisma.overheadItem.findMany({ where: { ativo: true } });
    const rateCard = calcularRateCard(profissionais, overheadItems, config.margemAlvoPct);

    // 4. Construir resposta com preço floor
    const entregaveisComPreco = entregaveis.map((entregavel) => {
      const rcLine = rateCard.find((rc) => rc.profissionalId === entregavel.profissionalId);
      const horaVendida = rcLine?.horaVendida || 0;
      const precoFloor = calcularPrecoFloorEntregavel(entregavel.tempoMinutos, horaVendida);

      return {
        id: entregavel.id,
        nome: entregavel.nome,
        categoria: entregavel.categoria,
        tempoMinutos: entregavel.tempoMinutos,
        unidade: entregavel.unidade,
        profissional: {
          id: entregavel.profissional.id,
          nome: entregavel.profissional.nome,
          funcao: entregavel.profissional.funcao,
          horaVendida,
        },
        precoFloorUnitario: Math.round(precoFloor * 100) / 100,
        ativo: entregavel.ativo,
        criadoEm: entregavel.criadoEm,
      };
    });

    return NextResponse.json({ entregaveis: entregaveisComPreco }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar entregáveis:", error);
    return NextResponse.json({ error: "Erro ao buscar entregáveis" }, { status: 500 });
  }
}

// POST /api/entregaveis - Criar novo entregável
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, categoria, profissionalId, tempoMinutos, unidade } = body;

    // Validar campos obrigatórios
    if (!nome || !categoria || !profissionalId || tempoMinutos === undefined) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const entregavel = await prisma.entregavelCatalogo.create({
      data: {
        nome,
        categoria,
        profissionalId,
        tempoMinutos,
        unidade: unidade || "unidade",
        ativo: true,
      },
      include: { profissional: true },
    });

    // Recalcular ConfigAgencia
    await recalcularConfigAgencia();

    return NextResponse.json(entregavel, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar entregável:", error);
    return NextResponse.json({ error: "Erro ao criar entregável" }, { status: 500 });
  }
}

// Helper: Recalcular ConfigAgencia quando dados mudam
async function recalcularConfigAgencia() {
  const overheadItems = await prisma.overheadItem.findMany({ where: { ativo: true } });
  const profissionais = await prisma.profissional.findMany({ where: { ativo: true } });

  const overheadTotal = overheadItems.reduce((sum, item) => sum + item.valor * item.proporcional, 0);
  const horasProdutivas = profissionais.reduce((sum, p) => sum + p.capacidadeMes, 0);
  const horaEmpresa = horasProdutivas > 0 ? overheadTotal / horasProdutivas : 0;

  const config = await prisma.configAgencia.findFirst();
  if (config) {
    await prisma.configAgencia.update({
      where: { id: config.id },
      data: {
        horaEmpresaSugerida: Math.round(horaEmpresa * 100) / 100,
      },
    });
  }
}
