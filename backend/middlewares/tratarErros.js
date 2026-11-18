// Tratamento central de erros: toda falha vira uma resposta JSON { "mensagem": "..." },
// que é o formato que o front-end (js/api.js) mostra para o usuário.

const { ErroDaAplicacao } = require("../servicos/erros");

// Códigos de erro do PostgreSQL usados como segunda linha de defesa,
// caso alguma regra escape da camada de serviço.
const ERROS_DO_BANCO = {
  23505: { status: 409, mensagem: "Já existe um registro com estes dados." }, // UNIQUE
  23503: { status: 409, mensagem: "Operação não permitida: existem registros vinculados." }, // FOREIGN KEY
  23514: { status: 400, mensagem: "Os dados enviados não respeitam as regras do cadastro." }, // CHECK
};

function rotaNaoEncontrada(req, res) {
  res.status(404).json({ mensagem: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

function descreverErro(erro) {
  if (erro instanceof ErroDaAplicacao) return { status: erro.status, mensagem: erro.message };
  if (erro.type === "entity.parse.failed") {
    return { status: 400, mensagem: "O corpo da requisição não é um JSON válido." };
  }
  if (ERROS_DO_BANCO[erro.code]) return ERROS_DO_BANCO[erro.code];
  return null;
}

// O Express reconhece um middleware de erro pelos 4 parâmetros, por isso "next" fica na assinatura.
// eslint-disable-next-line no-unused-vars
function tratarErros(erro, req, res, next) {
  const erroConhecido = descreverErro(erro);
  if (erroConhecido) {
    res.status(erroConhecido.status).json({ mensagem: erroConhecido.mensagem });
    return;
  }
  console.error(erro); // erro inesperado: registra no log do servidor, sem expor detalhes ao usuário
  res.status(500).json({ mensagem: "Ocorreu um erro inesperado no servidor." });
}

module.exports = { rotaNaoEncontrada, tratarErros };
