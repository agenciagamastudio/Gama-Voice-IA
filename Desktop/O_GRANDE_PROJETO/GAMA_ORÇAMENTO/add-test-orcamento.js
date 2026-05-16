// Script para adicionar orçamento de teste ao localStorage via localStorage
const testOrcamento = {
  id: "test-001",
  numero: "001",
  cliente: { nome: "Cliente Teste", cpf_cnpj: "123.456.789-00", email: "teste@email.com", telefone: "(11) 99999-9999" },
  datas: { emissao: "2026-05-13", validade: "2026-06-13" },
  itens: [
    { id: "1", descricao: "Design de Logo", quantidade: 1, preco_unitario: 500, total: 500 },
    { id: "2", descricao: "Cartão de Visita (500 un)", quantidade: 1, preco_unitario: 150, total: 150 },
  ],
  desconto_percentual: 10,
  status: "Rascunho",
  criado_em: new Date().toISOString(),
  atualizado_em: new Date().toISOString(),
};

console.log(JSON.stringify([testOrcamento]));
