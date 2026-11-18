// Camada de dados: único lugar do back-end que escreve SQL da tabela "fornecedores".

const { consultar } = require("./conexao");

const COLUNAS = "id, nome, cnpj";

async function listarTodos() {
  return consultar(`SELECT ${COLUNAS} FROM fornecedores ORDER BY nome`);
}

async function buscarPorId(id) {
  const [fornecedor] = await consultar(`SELECT ${COLUNAS} FROM fornecedores WHERE id = $1`, [id]);
  return fornecedor ?? null;
}

async function buscarPorCnpj(cnpj) {
  const [fornecedor] = await consultar(`SELECT ${COLUNAS} FROM fornecedores WHERE cnpj = $1`, [cnpj]);
  return fornecedor ?? null;
}

async function inserir({ nome, cnpj }) {
  const [fornecedor] = await consultar(
    `INSERT INTO fornecedores (nome, cnpj) VALUES ($1, $2) RETURNING ${COLUNAS}`,
    [nome, cnpj]
  );
  return fornecedor;
}

async function atualizar(id, { nome, cnpj }) {
  const [fornecedor] = await consultar(
    `UPDATE fornecedores SET nome = $1, cnpj = $2 WHERE id = $3 RETURNING ${COLUNAS}`,
    [nome, cnpj, id]
  );
  return fornecedor ?? null;
}

async function excluir(id) {
  await consultar("DELETE FROM fornecedores WHERE id = $1", [id]);
}

module.exports = { listarTodos, buscarPorId, buscarPorCnpj, inserir, atualizar, excluir };
