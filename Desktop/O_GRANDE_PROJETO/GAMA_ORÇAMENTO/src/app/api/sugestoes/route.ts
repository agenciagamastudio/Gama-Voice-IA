import { NextRequest, NextResponse } from "next/server";
import { gerarSugestoesPreco } from "@/lib/pricing/sugestoes";

export async function GET(request: NextRequest) {
  try {
    // Extrai parâmetros da query string
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("templateId");
    const clienteId = searchParams.get("clienteId");
    const floorStr = searchParams.get("floor");

    // Validações
    if (!templateId || !clienteId || !floorStr) {
      return NextResponse.json(
        {
          error: "Missing required parameters: templateId, clienteId, floor",
        },
        { status: 400 }
      );
    }

    const floor = parseFloat(floorStr);
    if (isNaN(floor) || floor <= 0) {
      return NextResponse.json(
        {
          error: "floor must be a positive number",
        },
        { status: 400 }
      );
    }

    // Chama a função de geração de sugestões
    const sugestoes = await gerarSugestoesPreco(templateId, clienteId, floor);

    // Retorna sucesso
    return NextResponse.json(sugestoes, { status: 200 });
  } catch (error) {
    console.error("Erro em /api/sugestoes:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
