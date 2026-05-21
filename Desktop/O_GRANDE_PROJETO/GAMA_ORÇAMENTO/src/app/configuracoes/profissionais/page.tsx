"use client";

export default function ProfissionaisPage() {
  // TODO: Conectar a Prisma Client para buscar dados
  const profissionais = [
    {
      id: "1",
      nome: "Designer",
      funcao: "Design Gráfico",
      tipo: "freelance",
      horaCusto: 75,
      capacidadeMes: 120,
      ativo: true,
    },
    {
      id: "2",
      nome: "Editor / Storymaker",
      funcao: "Edição de Vídeo",
      tipo: "freelance",
      horaCusto: 50,
      capacidadeMes: 120,
      ativo: true,
    },
    {
      id: "3",
      nome: "Matheus",
      funcao: "Estratégia",
      tipo: "interno",
      horaCusto: 100,
      capacidadeMes: 120,
      ativo: true,
    },
    {
      id: "4",
      nome: "Graça",
      funcao: "Gestão de Redes",
      tipo: "interno",
      horaCusto: 60,
      capacidadeMes: 120,
      ativo: true,
    },
  ];

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
                👤 Profissionais
              </h1>
              <p className="text-slate-400 mt-2">
                Gerencie profissionais, hora-custo e capacidade
              </p>
            </div>
            <button className="px-6 py-3 bg-[primary] text-black rounded-lg font-bold hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] hover:scale-105 active:scale-95 transition-all">
              + Novo Profissional
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Table Card */}
          <div className="glass glass-card p-8 border border-[rgba(148,163,184,0.1)] rounded-lg mb-12">
            <div className="mb-6">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Lista de Profissionais</p>
              <p className="text-slate-300 text-sm">
                Total de profissionais ativos: <span className="text-[primary] font-bold">{profissionais.filter((p) => p.ativo).length}</span>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(148,163,184,0.1)]">
                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Nome</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Função</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Tipo</th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Hora-Custo</th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Cap./Mês</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {profissionais.map((p) => (
                    <tr key={p.id} className="border-b border-[rgba(148,163,184,0.05)] hover:bg-[rgba(136,206,17,0.05)] transition-colors">
                      <td className="py-4 px-4 font-medium text-white">{p.nome}</td>
                      <td className="py-4 px-4 text-slate-300">{p.funcao}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            p.tipo === "interno"
                              ? "bg-blue-500/30 text-blue-200"
                              : "bg-purple-500/30 text-purple-200"
                          }`}
                        >
                          {p.tipo === "interno" ? "Interno" : "Freelance"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-slate-300">R$ {p.horaCusto.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{p.capacidadeMes}h</td>
                      <td className="py-4 px-4 text-center">
                        {p.ativo ? (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Section */}
          <div className="glass glass-card p-8 border border-[primary]/30 bg-[rgba(136,206,17,0.05)] rounded-lg">
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">💡</span>
              <div>
                <h2 className="text-lg font-bold text-[primary] mb-2">Nota Importante</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Mudanças aqui afetam a Rate Card automaticamente. Sempre que você adiciona/edita profissional ou muda
                  hora-custo/capacidade, a tabela de preços é recalculada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
