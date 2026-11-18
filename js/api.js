// Camada de serviço: o único lugar do front-end que conversa com o back-end.
// As telas chamam as funções de `api` e nunca usam fetch diretamente.
//
// Contrato esperado do back-end (combinar com quem faz o serviço Web):
//   - Respostas de sucesso em JSON (ou 204 sem corpo, no DELETE).
//   - Respostas de erro em JSON no formato { "mensagem": "texto para o usuário" }.

// As telas são entregues pelo próprio back-end (localhost:3000 ou o endereço publicado),
// então a API fica no mesmo endereço da página e basta um caminho relativo ("").
// Se o HTML for aberto direto do disco ou pelo Live Server (porta 5500), usa o back-end local.
const ABERTA_FORA_DO_SERVIDOR = window.location.protocol === "file:" || window.location.port === "5500";
const API_URL = ABERTA_FORA_DO_SERVIDOR ? "http://localhost:3000" : "";

const MENSAGEM_SEM_CONEXAO = "Não foi possível conectar ao servidor. Tente novamente em instantes.";
const MENSAGEM_ERRO_GENERICO = "Ocorreu um erro inesperado no servidor.";

async function requisitar(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(API_URL + caminho, opcoes);
  } catch {
    throw new Error(MENSAGEM_SEM_CONEXAO);
  }

  if (!resposta.ok) {
    throw new Error(await lerMensagemDeErro(resposta));
  }
  return resposta.status === 204 ? null : resposta.json();
}

async function lerMensagemDeErro(resposta) {
  try {
    const corpo = await resposta.json();
    return corpo.mensagem || MENSAGEM_ERRO_GENERICO;
  } catch {
    return MENSAGEM_ERRO_GENERICO;
  }
}

// O cabeçalho Content-Type só vai nas requisições com corpo (POST/PUT);
// num GET ele faria o navegador exigir uma verificação extra de CORS do servidor.
function comCorpo(metodo, dados) {
  return {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  };
}

const api = {
  // Fornecedores
  listarFornecedores: () => requisitar("/fornecedores"),
  buscarFornecedor: (id) => requisitar(`/fornecedores/${id}`),
  criarFornecedor: (dados) => requisitar("/fornecedores", comCorpo("POST", dados)),
  atualizarFornecedor: (id, dados) => requisitar(`/fornecedores/${id}`, comCorpo("PUT", dados)),
  excluirFornecedor: (id) => requisitar(`/fornecedores/${id}`, { method: "DELETE" }),

  // Produtos (sempre vinculados a um fornecedor)
  listarProdutos: (idFornecedor) => requisitar(`/fornecedores/${idFornecedor}/produtos`),
  criarProduto: (idFornecedor, dados) =>
    requisitar(`/fornecedores/${idFornecedor}/produtos`, comCorpo("POST", dados)),
  atualizarProduto: (id, dados) => requisitar(`/produtos/${id}`, comCorpo("PUT", dados)),
  excluirProduto: (id) => requisitar(`/produtos/${id}`, { method: "DELETE" }),
};
