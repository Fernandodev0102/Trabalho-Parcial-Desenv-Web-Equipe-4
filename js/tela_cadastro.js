// Tela de cadastro/edição de fornecedor (issue #2).
// Sem "?id=" na URL a tela cadastra um novo fornecedor; com "?id=X" edita o fornecedor X.

const formulario = document.getElementById("formulario-fornecedor");
const campoNome = document.getElementById("nome");
const campoCnpj = document.getElementById("CNPJ");
const titulo = document.getElementById("titulo-pagina");
const botaoSalvar = document.getElementById("botao-salvar");

const idFornecedor = obterIdDaUrl();
const estaEditando = idFornecedor !== null;

function lerDadosDoFormulario() {
  return {
    nome: campoNome.value.trim(),
    cnpj: removerPontuacaoCnpj(campoCnpj.value.trim()),
  };
}

function preencherFormulario(fornecedor) {
  campoNome.value = fornecedor.nome;
  campoCnpj.value = fornecedor.cnpj;
}

function ajustarTelaParaEdicao() {
  document.title = "Edição de fornecedor";
  titulo.textContent = "Editar fornecedor";
  botaoSalvar.textContent = "Salvar alterações";
}

async function carregarFornecedorParaEdicao() {
  ajustarTelaParaEdicao();
  try {
    preencherFormulario(await api.buscarFornecedor(idFornecedor));
  } catch (erro) {
    exibirMensagem(erro.message);
    botaoSalvar.disabled = true; // sem os dados atuais não há o que editar
  }
}

function salvarFornecedor(dados) {
  return estaEditando
    ? api.atualizarFornecedor(idFornecedor, dados)
    : api.criarFornecedor(dados);
}

async function aoEnviarFormulario(evento) {
  evento.preventDefault();
  esconderMensagem();

  const dados = lerDadosDoFormulario();
  const erros = validarFornecedor(dados);
  if (erros.length > 0) {
    exibirMensagem(erros.join("\n"));
    return;
  }

  botaoSalvar.disabled = true; // evita cadastro duplicado por clique duplo
  try {
    await salvarFornecedor(dados);
    window.location.href = "tela_inicial.html";
  } catch (erro) {
    exibirMensagem(erro.message);
    botaoSalvar.disabled = false;
  }
}

formulario.addEventListener("submit", aoEnviarFormulario);

if (estaEditando) {
  carregarFornecedorParaEdicao();
}
