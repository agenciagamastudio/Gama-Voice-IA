import { EntregavelCatalogo, Profissional } from "@prisma/client";

export function minutosParaHoras(minutos: number): number {
  return minutos / 60;
}

export function calcularPrecoFloorEntregavel(
  tempoMinutos: number,
  horaVendidaProfissional: number
): number {
  const horas = minutosParaHoras(tempoMinutos);
  return horas * horaVendidaProfissional;
}

export interface EntregavelComPreco {
  id: string;
  nome: string;
  categoria: string;
  profissionalId: string;
  profissionalNome: string;
  profissionalFuncao: string;
  tempoMinutos: number;
  unidade: string;
  ativo: boolean;
  horaVendidaAplicada: number;
  precoFloorUnitario: number;
}

export function construirEntregavelComPreco(
  entregavel: EntregavelCatalogo,
  profissional: Profissional,
  horaVendida: number
): EntregavelComPreco {
  const precoFloor = calcularPrecoFloorEntregavel(
    entregavel.tempoMinutos,
    horaVendida
  );

  return {
    id: entregavel.id,
    nome: entregavel.nome,
    categoria: entregavel.categoria,
    profissionalId: profissional.id,
    profissionalNome: profissional.nome,
    profissionalFuncao: profissional.funcao,
    tempoMinutos: entregavel.tempoMinutos,
    unidade: entregavel.unidade,
    ativo: entregavel.ativo,
    horaVendidaAplicada: horaVendida,
    precoFloorUnitario: Math.round(precoFloor * 100) / 100, // Arredondar para 2 casas decimais
  };
}
