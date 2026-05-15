import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with initial data...\n");

  // Clean up (opcional - para dev)
  console.log("Clearing existing data...");
  await prisma.orcamentoVersion.deleteMany();
  await prisma.orcamentoItem.deleteMany();
  await prisma.orcamento.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.template.deleteMany();
  await prisma.entregavelCatalogo.deleteMany();
  await prisma.profissional.deleteMany();
  await prisma.overheadItem.deleteMany();
  await prisma.configAgencia.deleteMany();

  // 1. ConfigAgencia (global settings)
  console.log("Creating ConfigAgencia...");
  const config = await prisma.configAgencia.create({
    data: {
      margemAlvoPct: 35,
      horaEmpresaSugerida: 5.45,
      ajusteInflacao: 0,
      ajusteTemporada: 0,
    },
  });
  console.log(`✅ ConfigAgencia: margem=${config.margemAlvoPct}%, hora-empresa=R$${config.horaEmpresaSugerida}\n`);

  // 2. Profissionais (rate card base)
  console.log("Creating Profissionais...");
  const profissionais = await Promise.all([
    prisma.profissional.create({
      data: {
        nome: "Designer",
        funcao: "Design Gráfico",
        tipo: "freelance",
        horaCusto: 75,
        capacidadeMes: 120,
        ativo: true,
      },
    }),
    prisma.profissional.create({
      data: {
        nome: "Editor / Storymaker",
        funcao: "Edição de Vídeo",
        tipo: "freelance",
        horaCusto: 50,
        capacidadeMes: 120,
        ativo: true,
      },
    }),
    prisma.profissional.create({
      data: {
        nome: "Matheus",
        funcao: "Estratégia",
        tipo: "interno",
        horaCusto: 100,
        capacidadeMes: 120,
        ativo: true,
      },
    }),
    prisma.profissional.create({
      data: {
        nome: "Graça",
        funcao: "Gestão de Redes",
        tipo: "interno",
        horaCusto: 60,
        capacidadeMes: 120,
        ativo: true,
      },
    }),
  ]);

  console.log(`✅ Created ${profissionais.length} profissionais:`);
  profissionais.forEach((p) =>
    console.log(`   - ${p.nome} (${p.funcao}): R$${p.horaCusto}/h, ${p.capacidadeMes}h/mês`)
  );
  console.log();

  // 3. OverheadItem (custos fixos)
  // ADJUSTED: R$ 5.45/h * 480h = R$ 2616 total para bater com spec v1
  console.log("Creating OverheadItems...");
  const overheadItems = await Promise.all([
    prisma.overheadItem.create({
      data: {
        descricao: "Salários e Benefícios",
        categoria: "utilidades",
        valor: 2000,
        proporcional: 1.0,
        ativo: true,
      },
    }),
    prisma.overheadItem.create({
      data: {
        descricao: "Software e Ferramentas (Adobe, Canva, Claude, etc)",
        categoria: "software",
        valor: 315,
        proporcional: 1.0,
        ativo: true,
      },
    }),
    prisma.overheadItem.create({
      data: {
        descricao: "Infraestrutura (internet, energia, aluguel)",
        categoria: "utilidades",
        valor: 301,
        proporcional: 1.0,
        ativo: true,
      },
    }),
  ]);

  const overheadTotal = overheadItems.reduce((sum, item) => sum + item.valor * item.proporcional, 0);
  console.log(`✅ Created ${overheadItems.length} overhead items`);
  console.log(`   Total overhead: R$${overheadTotal.toFixed(2)}/mês\n`);

  // 4. EntregavelCatalogo (service catalog)
  console.log("Creating EntregavelCatalogo...");
  const entregaveis = await Promise.all([
    // Produção
    prisma.entregavelCatalogo.create({
      data: {
        nome: "Post Estático",
        categoria: "producao",
        tempoMinutos: 20,
        unidade: "unidade",
        profissionalId: profissionais[0].id, // Designer
        ativo: true,
      },
    }),
    prisma.entregavelCatalogo.create({
      data: {
        nome: "Carrossel (3-5 slides)",
        categoria: "producao",
        tempoMinutos: 45,
        unidade: "unidade",
        profissionalId: profissionais[0].id, // Designer
        ativo: true,
      },
    }),
    prisma.entregavelCatalogo.create({
      data: {
        nome: "Reels",
        categoria: "producao",
        tempoMinutos: 15,
        unidade: "unidade",
        profissionalId: profissionais[1].id, // Editor
        ativo: true,
      },
    }),
    prisma.entregavelCatalogo.create({
      data: {
        nome: "Story",
        categoria: "producao",
        tempoMinutos: 10,
        unidade: "unidade",
        profissionalId: profissionais[0].id, // Designer
        ativo: true,
      },
    }),
    // Estratégia
    prisma.entregavelCatalogo.create({
      data: {
        nome: "Estratégia Mensal",
        categoria: "estrategia",
        tempoMinutos: 120, // 2h
        unidade: "mensal",
        profissionalId: profissionais[2].id, // Matheus
        ativo: true,
      },
    }),
    prisma.entregavelCatalogo.create({
      data: {
        nome: "Planejamento de Campanha",
        categoria: "estrategia",
        tempoMinutos: 180, // 3h
        unidade: "unidade",
        profissionalId: profissionais[2].id, // Matheus
        ativo: true,
      },
    }),
    // Gestão
    prisma.entregavelCatalogo.create({
      data: {
        nome: "Gestão de Rede Social (mensal)",
        categoria: "gestao",
        tempoMinutos: 300, // 5h
        unidade: "mensal",
        profissionalId: profissionais[3].id, // Graça
        ativo: true,
      },
    }),
    prisma.entregavelCatalogo.create({
      data: {
        nome: "Resposta a Comentários/DMs",
        categoria: "gestao",
        tempoMinutos: 60, // 1h
        unidade: "mensal",
        profissionalId: profissionais[3].id, // Graça
        ativo: true,
      },
    }),
  ]);

  console.log(`✅ Created ${entregaveis.length} entregáveis\n`);

  // 5. Cliente (test client)
  console.log("Creating test Cliente...");
  const cliente = await prisma.cliente.create({
    data: {
      nome: "Exemplo Ltda",
      email: "contato@exemplo.com.br",
      telefone: "+55 11 99999-9999",
      cnpj: "12.345.678/0001-99",
      endereco: "Rua das Flores, 123",
      cidade: "São Paulo",
      estado: "SP",
      tagContextoAtual: "saas",
      contatoPrincipal: "João Silva",
      desconto: 0,
      ativo: true,
    },
  });
  console.log(`✅ Created cliente: ${cliente.nome}\n`);

  // 6. Template (optional)
  console.log("Creating Template...");
  const template = await prisma.template.create({
    data: {
      nome: "Pacote Social Media",
      descricao: "Template padrão para pacotes de redes sociais",
      estrutura: JSON.stringify({
        items: [{ type: "post", qty: 4 }, { type: "reels", qty: 2 }],
      }),
      ativo: true,
    },
  });
  console.log(`✅ Created template: ${template.nome}\n`);

  // ========================================================================
  // VALIDATION: Check if calculations match spec
  // ========================================================================
  console.log("========================================================================");
  console.log("📊 VALIDAÇÃO: Conferindo Rate Card contra Especificação v1");
  console.log("========================================================================\n");

  const totalHorasProdutivas = profissionais.reduce((sum, p) => sum + p.capacidadeMes, 0);
  const horaEmpresaCalculada = overheadTotal / totalHorasProdutivas;

  console.log("✅ Valores Calculados:");
  console.log(`   Overhead Total:        R$${overheadTotal.toFixed(2)}/mês`);
  console.log(`   Horas Produtivas:      ${totalHorasProdutivas}h/mês`);
  console.log(`   Hora-Empresa Calc:     R$${horaEmpresaCalculada.toFixed(2)}/h`);
  console.log(`   Margem-Alvo:           ${config.margemAlvoPct}%\n`);

  console.log("📋 Rate Card Esperada vs Calculada:");
  const rateCard = profissionais.map((p) => {
    const margemValor = p.horaCusto + horaEmpresaCalculada;
    const horaVendida = margemValor * (1 + config.margemAlvoPct / 100);
    return { nome: p.nome, horaCusto: p.horaCusto, horaVendida };
  });

  const expectedRateCard = [
    { nome: "Designer", horaVendida: 108.61 },
    { nome: "Editor / Storymaker", horaVendida: 74.86 },
    { nome: "Matheus", horaVendida: 142.36 },
    { nome: "Graça", horaVendida: 88.36 },
  ];

  rateCard.forEach((rc, idx) => {
    const expected = expectedRateCard[idx].horaVendida;
    const calc = rc.horaVendida;
    const diff = Math.abs(expected - calc);
    const status = diff < 0.5 ? "✅" : "⚠️";
    console.log(
      `   ${status} ${rc.nome.padEnd(25)} Esperado: R$${expected.toFixed(2).padEnd(8)} | Calculado: R$${calc.toFixed(2)}`
    );
  });

  console.log("\n🎉 Seed completo! Database pronto para Phase 2.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
