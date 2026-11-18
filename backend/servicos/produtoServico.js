// Camada de serviço: regras de negócio dos produtos.
// Todo produto pertence a um fornecedor, por isso as operações conferem se ele existe.

const produtoRepositorio = require("../dados/produtoRepositorio");
const fornecedorServico = require("./fornecedorServico");
const { prepararProduto, converterId } = require("./validacoes");
const { ErroNaoEncontrado } = require("./erros");

const MENSAGEM_NAO_ENCONTRADO = "Produto não encontrado.";

async function buscar(idRecebido) {
  const id = converterId(idRecebido, MENSAGEM_NAO_ENCONTRADO);
  const produto = await produtoRepositorio.buscarPorId(id);
  if (!produto) throw new ErroNaoEncontrado(MENSAGEM_NAO_ENCONTRADO);
  return produto;
}

async function listarDoFornecedor(idFornecedor) {
  const fornecedor = await fornecedorServico.buscar(idFornecedor);
  return produtoRepositorio.listarPorFornecedor(fornecedor.id);
}

async function criar(idFornecedor, dados) {
  const fornecedor = await fornecedorServico.buscar(idFornecedor);
  return produtoRepositorio.inserir(fornecedor.id, prepararProduto(dados));
}

async function atualizar(idRecebido, dados) {
  const { id } = await buscar(idRecebido);
  return produtoRepositorio.atualizar(id, prepararProduto(dados));
}

async function excluir(idRecebido) {
  const { id } = await buscar(idRecebido);
  await produtoRepositorio.excluir(id);
}

module.exports = { listarDoFornecedor, criar, atualizar, excluir };
