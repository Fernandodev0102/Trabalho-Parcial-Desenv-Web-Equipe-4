// Tela inicial: lista os fornecedores vindos do back-end (issue #3)
// e permite excluí-los, respeitando a trava de produtos vinculados (issue #4).

const corpoTabela = document.getElementById("corpo-tabela-fornecedores");

function formatarCnpj(cnpj) {
  const digitos = String(cnpj).replace(/\D/g, "");
  if (digitos.length !== 14) return cnpj;
  return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function criarLinkDeAcao(texto, endereco) {
  const link = document.createElement("a");
  link.className = "botao-atributos";
  link.textContent = texto;
  link.href = endereco;
  return link;
}

function criarBotaoExcluir(fornecedor) {
  const botao = document.createElement("button");
  botao.className = "botao-atributos";
  botao.textContent = "Excluir cadastro";
  botao.addEventListener("click", () => excluirFornecedor(fornecedor));
  return botao;
}

function criarCelulaDeAcoes(fornecedor) {
  const celula = document.createElement("td");
  celula.append(
    criarLinkDeAcao("Editar", `tela_cadastro.html?id=${fornecedor.id}`),
    criarLinkDeAcao("Ver produtos", `lista-produtos-fornecedores.html?id=${fornecedor.id}`),
    criarBotaoExcluir(fornecedor)
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

function exibirFornecedores(fornecedores) {
  if (fornecedores.length === 0) {
    exibirLinhaInformativa(corpoTabela, "Nenhum fornecedor cadastrado.");
    return;
  }
  corpoTabela.replaceChildren(...fornecedores.map(criarLinhaFornecedor));
}

async function carregarFornecedores() {
  exibirLinhaInformativa(corpoTabela, "Carregando fornecedores...");
  try {
    exibirFornecedores(await api.listarFornecedores());
  } catch (erro) {
    exibirLinhaInformativa(corpoTabela, "Não foi possível carregar a lista.");
    exibirMensagem(erro.message);
  }
}

// A trava também precisa existir no back-end; esta checagem antecipa a
// mensagem para o usuário antes mesmo de pedir a confirmação.
async function verificarSePodeExcluir(fornecedor) {
  const erros = validarExclusaoFornecedor(await api.listarProdutos(fornecedor.id));
  if (erros.length > 0) {
    exibirMensagem(erros.join("\n"));
    return false;
  }
  return true;
}

async function excluirFornecedor(fornecedor) {
  esconderMensagem();
  try {
    if (!(await verificarSePodeExcluir(fornecedor))) return;
    if (!confirm(`Deseja realmente excluir o fornecedor "${fornecedor.nome}"?`)) return;

    await api.excluirFornecedor(fornecedor.id);
    await carregarFornecedores();
  } catch (erro) {
    exibirMensagem(erro.message);
  }
}

carregarFornecedores();
