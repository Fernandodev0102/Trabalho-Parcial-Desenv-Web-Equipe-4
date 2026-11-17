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
