// Camada de serviço: regras de negócio dos fornecedores.
// Não conhece HTTP (req/res) nem SQL; recebe dados, aplica as regras e chama os repositórios.

const fornecedorRepositorio = require("../dados/fornecedorRepositorio");
const produtoRepositorio = require("../dados/produtoRepositorio");
const { prepararFornecedor, converterId } = require("./validacoes");
const { ErroNaoEncontrado, ErroDeConflito } = require("./erros");

const MENSAGEM_NAO_ENCONTRADO = "Fornecedor não encontrado.";

async function listar() {
  return fornecedorRepositorio.listarTodos();
}

async function buscar(idRecebido) {
  const id = converterId(idRecebido, MENSAGEM_NAO_ENCONTRADO);
  const fornecedor = await fornecedorRepositorio.buscarPorId(id);
  if (!fornecedor) throw new ErroNaoEncontrado(MENSAGEM_NAO_ENCONTRADO);
  return fornecedor;
}

// CNPJ não pode se repetir. Na edição, o próprio fornecedor pode manter o CNPJ que já tem.
async function garantirCnpjDisponivel(cnpj, idDoProprioFornecedor = null) {
  const dono = await fornecedorRepositorio.buscarPorCnpj(cnpj);
  if (dono && dono.id !== idDoProprioFornecedor) {
    throw new ErroDeConflito(`Já existe um fornecedor cadastrado com este CNPJ (${dono.nome}).`);
  }
}

async function criar(dados) {
  const fornecedor = prepararFornecedor(dados);
  await garantirCnpjDisponivel(fornecedor.cnpj);
  return fornecedorRepositorio.inserir(fornecedor);
}

async function atualizar(idRecebido, dados) {
  const { id } = await buscar(idRecebido);
  const fornecedor = prepararFornecedor(dados);
  await garantirCnpjDisponivel(fornecedor.cnpj, id);
  return fornecedorRepositorio.atualizar(id, fornecedor);
}

// Regra do cenário: não é permitido excluir um fornecedor que ainda tem produtos.
async function excluir(idRecebido) {
  const { id } = await buscar(idRecebido);
  const quantidadeDeProdutos = await produtoRepositorio.contarPorFornecedor(id);
  if (quantidadeDeProdutos > 0) {
    const descricao =
      quantidadeDeProdutos === 1 ? "1 produto cadastrado" : `${quantidadeDeProdutos} produtos cadastrados`;
    throw new ErroDeConflito(
      `Não é possível excluir este fornecedor: ele ainda tem ${descricao}. Exclua os produtos antes.`
    );
  }
  await fornecedorRepositorio.excluir(id);
}

module.exports = { listar, buscar, criar, atualizar, excluir };
