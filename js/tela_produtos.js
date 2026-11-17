// Tela de produtos de um fornecedor (issue #5).
// Aberta pela tela inicial com "?id=X": lista e cadastra produtos apenas do fornecedor X.

const formulario = document.getElementById("formulario-produto");
const campoNome = document.getElementById("nome-produto");
const campoEstoque = document.getElementById("estoque");
const campoIdFornecedor = document.getElementById("id_fornecedor");
const botaoSalvar = document.getElementById("botao-salvar");
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

function criarLinhaProduto(produto) {
  const linha = document.createElement("tr");
  const celulaDeAcoes = document.createElement("td"); // botões Editar/Excluir: issue #6
  linha.append(criarCelula(produto.nome), criarCelula(produto.estoque), celulaDeAcoes);
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
    await api.criarProduto(idFornecedor, dados);
    formulario.reset();
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
iniciarTela();
