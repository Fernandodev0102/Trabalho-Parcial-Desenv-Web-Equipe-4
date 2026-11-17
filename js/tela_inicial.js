// Tela inicial: lista os fornecedores vindos do back-end (issue #3).

const corpoTabela = document.getElementById("corpo-tabela-fornecedores");

const TOTAL_COLUNAS = 3;

function formatarCnpj(cnpj) {
  const digitos = String(cnpj).replace(/\D/g, "");
  if (digitos.length !== 14) return cnpj;
  return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  return celula;
}

function criarLinkDeAcao(texto, endereco) {
  const link = document.createElement("a");
  link.className = "botao-atributos";
  link.textContent = texto;
  link.href = endereco;
  return link;
}

function criarBotaoExcluir(idFornecedor) {
  const botao = document.createElement("button");
  botao.className = "botao-atributos";
  botao.textContent = "Excluir cadastro";
  botao.dataset.idFornecedor = idFornecedor; // usado na exclusão (issue #4)
  return botao;
}

function criarCelulaDeAcoes(fornecedor) {
  const celula = document.createElement("td");
  celula.append(
    criarLinkDeAcao("Editar", `tela_cadastro.html?id=${fornecedor.id}`),
    criarLinkDeAcao("Ver produtos", `lista-produtos-fornecedores.html?id=${fornecedor.id}`),
    criarBotaoExcluir(fornecedor.id)
  );
  return celula;
}

function criarLinhaFornecedor(fornecedor) {
  const linha = document.createElement("tr");
  linha.append(
    criarCelula(fornecedor.nome),
    criarCelula(formatarCnpj(fornecedor.cnpj)),
    criarCelulaDeAcoes(fornecedor)
  );
  return linha;
}

function exibirLinhaInformativa(texto) {
  const celula = criarCelula(texto);
  celula.colSpan = TOTAL_COLUNAS;
  const linha = document.createElement("tr");
  linha.append(celula);
  corpoTabela.replaceChildren(linha);
}

function exibirFornecedores(fornecedores) {
  if (fornecedores.length === 0) {
    exibirLinhaInformativa("Nenhum fornecedor cadastrado.");
    return;
  }
  corpoTabela.replaceChildren(...fornecedores.map(criarLinhaFornecedor));
}

async function carregarFornecedores() {
  exibirLinhaInformativa("Carregando fornecedores...");
  try {
    exibirFornecedores(await api.listarFornecedores());
  } catch (erro) {
    exibirLinhaInformativa("Não foi possível carregar a lista.");
    exibirMensagem(erro.message);
  }
}

carregarFornecedores();
