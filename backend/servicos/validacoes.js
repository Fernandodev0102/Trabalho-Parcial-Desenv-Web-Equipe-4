// Regras de validação do Cenário 6 no back-end.
// Repetem as regras de js/validacao.js do front-end de propósito: a validação da tela
// pode ser contornada (por exemplo, enviando a requisição pelo Postman), a do servidor não.

const { ErroDeValidacao, ErroNaoEncontrado } = require("./erros");

const QUANTIDADE_DIGITOS_CNPJ = 14;
const TAMANHO_MAXIMO_NOME = 120;
const MAIOR_ID_DO_BANCO = 2147483647; // limite do tipo SERIAL do PostgreSQL

function textoLimpo(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

// Aceita o CNPJ com ou sem pontuação (12.345.678/0001-90 ou 12345678000190).
function removerPontuacaoCnpj(cnpj) {
  return textoLimpo(cnpj).replace(/[.\/\-\s]/g, "");
}

function validarNome(nome, mensagemSeVazio) {
  if (!nome) return [mensagemSeVazio];
  if (nome.length > TAMANHO_MAXIMO_NOME) {
    return [`O nome deve ter no máximo ${TAMANHO_MAXIMO_NOME} caracteres.`];
  }
  return [];
}

function validarCnpj(cnpj) {
  if (!cnpj) return ["Informe o CNPJ."];
  if (!new RegExp(`^\\d{${QUANTIDADE_DIGITOS_CNPJ}}$`).test(cnpj)) {
    return [`O CNPJ deve ter exatamente ${QUANTIDADE_DIGITOS_CNPJ} dígitos numéricos.`];
  }
  return [];
}

function validarEstoque(estoque) {
  if (estoque === undefined || estoque === null || estoque === "") {
    return ["Informe a quantidade em estoque."];
  }
  if (!Number.isInteger(estoque)) return ["A quantidade em estoque deve ser um número inteiro."];
  if (estoque < 0) return ["A quantidade em estoque não pode ser negativa."];
  return [];
}

function lancarSeHouverErros(erros) {
  if (erros.length > 0) throw new ErroDeValidacao(erros);
}

// Valida e devolve os dados do fornecedor já normalizados (nome sem espaços nas pontas, CNPJ só com dígitos).
function prepararFornecedor(dados = {}) {
  const fornecedor = { nome: textoLimpo(dados.nome), cnpj: removerPontuacaoCnpj(dados.cnpj) };
  lancarSeHouverErros([
    ...validarNome(fornecedor.nome, "Informe o nome da empresa."),
    ...validarCnpj(fornecedor.cnpj),
  ]);
  return fornecedor;
}

function prepararProduto(dados = {}) {
  const produto = { nome: textoLimpo(dados.nome), estoque: dados.estoque };
  lancarSeHouverErros([
    ...validarNome(produto.nome, "Informe o nome do produto."),
    ...validarEstoque(produto.estoque),
  ]);
  return produto;
}

// Converte o ":id" da URL em número. Um id que não é inteiro positivo não pode existir no banco,
// então a resposta é a mesma de um id inexistente: 404.
function converterId(valor, mensagemNaoEncontrado) {
  const id = Number(valor);
  const ehIdValido = /^\d+$/.test(String(valor)) && id > 0 && id <= MAIOR_ID_DO_BANCO;
  if (!ehIdValido) throw new ErroNaoEncontrado(mensagemNaoEncontrado);
  return id;
}

module.exports = { prepararFornecedor, prepararProduto, converterId };
