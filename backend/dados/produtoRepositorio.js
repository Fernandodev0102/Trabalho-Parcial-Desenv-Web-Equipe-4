// Camada de dados: único lugar do back-end que escreve SQL da tabela "produtos".
// A coluna fornecedor_id vira "fornecedorId" na resposta, seguindo o padrão do JavaScript.

const { consultar } = require("./conexao");

const COLUNAS = 'id, nome, estoque, fornecedor_id AS "fornecedorId"';

async function listarPorFornecedor(fornecedorId) {
  return consultar(`SELECT ${COLUNAS} FROM produtos WHERE fornecedor_id = $1 ORDER BY nome`, [
    fornecedorId,
  ]);
}

async function contarPorFornecedor(fornecedorId) {
  const [{ total }] = await consultar(
    "SELECT COUNT(*)::int AS total FROM produtos WHERE fornecedor_id = $1",
    [fornecedorId]
  );
  return total;
}

async function buscarPorId(id) {
  const [produto] = await consultar(`SELECT ${COLUNAS} FROM produtos WHERE id = $1`, [id]);
  return produto ?? null;
}

async function inserir(fornecedorId, { nome, estoque }) {
  const [produto] = await consultar(
    `INSERT INTO produtos (nome, estoque, fornecedor_id) VALUES ($1, $2, $3) RETURNING ${COLUNAS}`,
    [nome, estoque, fornecedorId]
  );
  return produto;
}

async function atualizar(id, { nome, estoque }) {
  const [produto] = await consultar(
    `UPDATE produtos SET nome = $1, estoque = $2 WHERE id = $3 RETURNING ${COLUNAS}`,
    [nome, estoque, id]
  );
  return produto ?? null;
}

async function excluir(id) {
  await consultar("DELETE FROM produtos WHERE id = $1", [id]);
}

module.exports = {
  listarPorFornecedor,
  contarPorFornecedor,
  buscarPorId,
  inserir,
  atualizar,
  excluir,
};
