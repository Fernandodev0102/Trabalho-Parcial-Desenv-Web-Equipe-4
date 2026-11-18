// Funções de interface usadas por mais de uma tela.

// Lê o parâmetro "id" da URL (ex.: tela_cadastro.html?id=3). Retorna null se não houver.
function obterIdDaUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

// Mostra uma mensagem de erro no elemento <p id="mensagem"> da tela.
function exibirMensagem(texto) {
  const areaMensagem = document.getElementById("mensagem");
  areaMensagem.textContent = texto;
  areaMensagem.hidden = false;
}

function esconderMensagem() {
  document.getElementById("mensagem").hidden = true;
}

// Cria uma célula de tabela com texto (textContent evita injeção de HTML).
function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  return celula;
}

// Substitui as linhas da tabela por uma única linha de aviso
// (ex.: "Carregando...", "Nenhum item cadastrado.").
function exibirLinhaInformativa(corpoTabela, texto) {
  const celula = criarCelula(texto);
  celula.colSpan = corpoTabela.closest("table").tHead.rows[0].cells.length;
  const linha = document.createElement("tr");
  linha.append(celula);
  corpoTabela.replaceChildren(linha);
}
