// Tela de produtos de um fornecedor (issues #5 e #6).
// Aberta pela tela inicial com "?id=X": lista, cadastra, edita e exclui produtos apenas do fornecedor X.
// O mesmo formulário serve para cadastro e edição: o campo oculto id_produto vazio = novo produto.

const formulario = document.getElementById("formulario-produto");
const campoNome = document.getElementById("nome-produto");
const campoEstoque = document.getElementById("estoque");
const campoIdProduto = document.getElementById("id_produto");
const campoIdFornecedor = document.getElementById("id_fornecedor");
const botaoSalvar = document.getElementById("botao-salvar");
const botaoCancelar = document.getElementById("botao-cancelar");
const nomeFornecedor = document.getElementById("nome_fornecedor");
const corpoTabela = document.getElementById("corpo-tabela-produtos");

const idFornecedor = obterIdDaUrl();

function lerDadosDoFormulario() {
  const estoqueDigitado = campoEstoque.value.trim();
  return {
    nome: campoNome.value.trim(),
    estoque: estoqueDigitado === "" ? null : Number(estoqueDigitado),
  };
}

function estaEditando() {
  return campoIdProduto.value !== "";
}

function entrarNoModoEdicao(produto) {
  esconderMensagem();
  campoIdProduto.value = produto.id;
  campoNome.value = produto.nome;
  campoEstoque.value = produto.estoque;
  botaoSalvar.textContent = "Salvar alterações";
  botaoCancelar.hidden = false;
  campoNome.focus();
}

function sairDoModoEdicao() {
  formulario.reset();
  campoIdProduto.value = ""; // reset() não limpa campos ocultos preenchidos via JavaScript
  botaoSalvar.textContent = "Salvar produto";
  botaoCancelar.hidden = true;
}

function criarBotaoDeAcao(texto, aoClicar) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "botao_atributo";
  botao.textContent = texto;
  botao.addEventListener("click", aoClicar);
  return botao;
}

function criarCelulaDeAcoes(produto) {
  const celula = document.createElement("td");
  celula.append(
    criarBotaoDeAcao("Editar", () => entrarNoModoEdicao(produto)),
    criarBotaoDeAcao("Excluir", () => excluirProduto(produto))
  );
  return celula;
}

function criarLinhaProduto(produto) {
  const linha = document.createElement("tr");
  linha.append(criarCelula(produto.nome), criarCelula(produto.estoque), criarCelulaDeAcoes(produto));
  return linha;
}

function exibirProdutos(produtos) {
  if (produtos.length === 0) {
    exibirLinhaInformativa(corpoTabela, "Nenhum produto cadastrado para este fornecedor.");
    return;
  }
  corpoTabela.replaceChildren(...produtos.map(criarLinhaProduto));
}

async function carregarProdutos() {
  exibirLinhaInformativa(corpoTabela, "Carregando produtos...");
  try {
    exibirProdutos(await api.listarProdutos(idFornecedor));
  } catch (erro) {
    exibirLinhaInformativa(corpoTabela, "Não foi possível carregar os produtos.");
    exibirMensagem(erro.message);
  }
}

async function carregarFornecedor() {
  const fornecedor = await api.buscarFornecedor(idFornecedor);
  nomeFornecedor.textContent = fornecedor.nome;
  document.title = `Produtos de ${fornecedor.nome}`;
}

// Usado quando não há fornecedor válido: sem ele não há produtos para mostrar ou cadastrar.
function bloquearTela(motivo) {
  nomeFornecedor.textContent = "—";
  botaoSalvar.disabled = true;
  exibirLinhaInformativa(corpoTabela, "Nenhum fornecedor selecionado.");
  exibirMensagem(motivo);
}

function salvarProduto(dados) {
  return estaEditando()
    ? api.atualizarProduto(campoIdProduto.value, dados)
    : api.criarProduto(idFornecedor, dados);
}

async function excluirProduto(produto) {
  esconderMensagem();
  if (!confirm(`Deseja realmente excluir o produto "${produto.nome}"?`)) return;
  try {
    await api.excluirProduto(produto.id);
    if (campoIdProduto.value === String(produto.id)) {
      sairDoModoEdicao(); // o produto que estava no formulário deixou de existir
    }
    await carregarProdutos();
  } catch (erro) {
    exibirMensagem(erro.message);
  }
}

async function aoEnviarFormulario(evento) {
  evento.preventDefault();
  esconderMensagem();

  const dados = lerDadosDoFormulario();
  const erros = validarProduto(dados);
  if (erros.length > 0) {
    exibirMensagem(erros.join("\n"));
    return;
  }

  botaoSalvar.disabled = true; // evita cadastro duplicado por clique duplo
  try {
    await salvarProduto(dados);
    sairDoModoEdicao();
    await carregarProdutos();
  } catch (erro) {
    exibirMensagem(erro.message);
  } finally {
    botaoSalvar.disabled = false;
  }
}

async function iniciarTela() {
  if (idFornecedor === null) {
    bloquearTela('Nenhum fornecedor foi selecionado. Volte à tela inicial e clique em "Ver produtos".');
    return;
  }
  campoIdFornecedor.value = idFornecedor;
  try {
    await carregarFornecedor();
  } catch (erro) {
    bloquearTela(erro.message);
    return;
  }
  carregarProdutos();
}

formulario.addEventListener("submit", aoEnviarFormulario);
botaoCancelar.addEventListener("click", () => {
  esconderMensagem();
  sairDoModoEdicao();
});
iniciarTela();
