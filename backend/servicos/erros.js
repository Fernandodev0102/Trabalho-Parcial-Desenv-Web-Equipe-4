// Erros de negócio. Cada um já carrega o status HTTP certo;
// o middleware tratarErros transforma qualquer um deles em { "mensagem": "..." }.

class ErroDaAplicacao extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status;
  }
}

// 400: os dados enviados não seguem as regras (campo vazio, CNPJ inválido, estoque negativo...).
class ErroDeValidacao extends ErroDaAplicacao {
  constructor(erros) {
    super(erros.join("\n"), 400);
    this.erros = erros;
  }
}

// 404: o fornecedor ou produto pedido não existe.
class ErroNaoEncontrado extends ErroDaAplicacao {
  constructor(mensagem) {
    super(mensagem, 404);
  }
}

// 409: a operação conflita com dados existentes (CNPJ repetido, fornecedor com produtos).
class ErroDeConflito extends ErroDaAplicacao {
  constructor(mensagem) {
    super(mensagem, 409);
  }
}

module.exports = { ErroDaAplicacao, ErroDeValidacao, ErroNaoEncontrado, ErroDeConflito };
