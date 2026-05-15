"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profissionais</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie profissionais, hora-custo e capacidade
          </p>
        </div>
        <Button>+ Novo Profissional</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Profissionais</CardTitle>
          <CardDescription>
            Total de profissionais ativos: {profissionais.filter((p) => p.ativo).length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Nome</th>
                  <th className="text-left py-3 px-2 font-semibold">Função</th>
                  <th className="text-left py-3 px-2 font-semibold">Tipo</th>
                  <th className="text-right py-3 px-2 font-semibold">Hora-Custo</th>
                  <th className="text-right py-3 px-2 font-semibold">Cap./Mês</th>
                  <th className="text-center py-3 px-2 font-semibold">Status</th>
                  <th className="text-center py-3 px-2 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {profissionais.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-2 font-medium">{p.nome}</td>
                    <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{p.funcao}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          p.tipo === "interno"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        }`}
                      >
                        {p.tipo === "interno" ? "Interno" : "Freelance"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">R$ {p.horaCusto.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right">{p.capacidadeMes}h</td>
                    <td className="py-3 px-2 text-center">
                      {p.ativo ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center text-sm">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">💡 Nota</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Mudanças aqui afetam a Rate Card automaticamente. Sempre que você adiciona/edita profissional ou muda
          hora-custo/capacidade, a tabela de preços é recalculada.
        </p>
      </div>
    </div>
  );
}
