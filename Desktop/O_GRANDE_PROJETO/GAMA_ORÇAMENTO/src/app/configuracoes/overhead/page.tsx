"use client";

export default function OverheadPage() {
  // TODO: Conectar a Prisma Client para buscar dados
  const overheadItems = [
    { id: "1", descricao: "Salários e Benefícios", categoria: "utilidades", valor: 2000, proporcional: 1.0, ativo: true },
    {
      id: "2",
      descricao: "Software e Ferramentas (Adobe, Canva, Claude, etc)",
      categoria: "software",
      valor: 315,
      proporcional: 1.0,
      ativo: true,
    },
    {
      id: "3",
      descricao: "Infraestrutura (internet, energia, aluguel)",
      categoria: "utilidades",
      valor: 301,
      proporcional: 1.0,
      ativo: true,
    },
  ];

  const overheadTotal = overheadItems
    .filter((item) => item.ativo)
    .reduce((sum, item) => sum + item.valor * item.proporcional, 0);

  const categoriaColors: Record<string, { badge: string }> = {
    utilidades: { badge: "bg-blue-500/30 text-blue-200" },
    software: { badge: "bg-purple-500/30 text-purple-200" },
    ferramentas: { badge: "bg-green-500/30 text-green-200" },
    outros: { badge: "bg-slate-500/30 text-slate-200" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] relative overflow-hidden">
      {/* Volumetric background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)]">
          <div className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[primary] to-[primary-light] bg-clip-text text-transparent">
                💰 Custos Fixos (Overhead)
              </h1>
              <p className="text-slate-400 mt-2">
                Configure custos mensais de infraestrutura e software
              </p>
            </div>
            <button className="px-6 py-3 bg-[primary] text-black rounded-lg font-bold hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] hover:scale-105 active:scale-95 transition-all">
              + Novo Item
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* KPI Card */}
          <div className="glass glass-card p-8 border border-[primary]/30 bg-[rgba(136,206,17,0.05)] mb-12 rounded-lg">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Total Mensal</p>
            <p className="text-5xl font-bold text-[primary] mb-2">R$ {overheadTotal.toFixed(2)}</p>
            <p className="text-slate-400 text-sm">Soma de todos os itens ativos e proporcionais</p>
          </div>

          {/* Table Card */}
          <div className="glass glass-card p-8 border border-[rgba(148,163,184,0.1)] rounded-lg mb-12">
            <div className="mb-6">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Itens de Overhead</p>
              <p className="text-slate-300 text-sm">
                Total de itens ativos: <span className="text-[primary] font-bold">{overheadItems.filter((i) => i.ativo).length}</span>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(148,163,184,0.1)]">
                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Descrição</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Categoria</th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Valor</th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Proporcional</th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Alocado</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {overheadItems.map((item) => {
                    const alocado = item.valor * item.proporcional;
                    return (
                      <tr key={item.id} className="border-b border-[rgba(148,163,184,0.05)] hover:bg-[rgba(136,206,17,0.05)] transition-colors">
                        <td className="py-4 px-4 font-medium text-white">{item.descricao}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              categoriaColors[item.categoria]?.badge || categoriaColors.outros.badge
                            }`}
                          >
                            {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-slate-300">R$ {item.valor.toFixed(2)}</td>
                        <td className="py-4 px-4 text-right text-slate-300">{(item.proporcional * 100).toFixed(0)}%</td>
                        <td className="py-4 px-4 text-right font-semibold text-[primary]">R$ {alocado.toFixed(2)}</td>
                        <td className="py-4 px-4 text-center">
                          {item.ativo ? (
                            <span className="px-3 py-1 rounded text-xs font-medium bg-green-500/30 text-green-200">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded text-xs font-medium bg-slate-500/30 text-slate-200">
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button className="px-3 py-1 text-[primary] hover:bg-[rgba(136,206,17,0.1)] rounded transition-colors text-sm font-medium">
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Section */}
          <div className="glass glass-card p-8 border border-[primary]/30 bg-[rgba(136,206,17,0.05)] rounded-lg">
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">💡</span>
              <div>
                <h2 className="text-lg font-bold text-[primary] mb-4">Sobre Proporcionais</h2>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                  Use o campo "Proporcional" para custos compartilhados:
                </p>
                <ul className="text-sm space-y-3 text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-[primary] flex-shrink-0">•</span>
                    <span><span className="text-white font-semibold">100%</span> = Custo integralmente alocado à agência (ex: Adobe CC)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[primary] flex-shrink-0">•</span>
                    <span><span className="text-white font-semibold">33%</span> = 1/3 do custo alocado (ex: 1/3 da internet residencial)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[primary] flex-shrink-0">•</span>
                    <span><span className="text-white font-semibold">50%</span> = Metade do custo (ex: aluguel compartilhado)</span>
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
