// Ponto de entrada: `npm start`.
// Lê o arquivo .env (se existir), conecta no banco, cria as tabelas e começa a atender na porta.

const { criarApp } = require("./app");
const { iniciarBanco } = require("./dados/conexao");

function carregarArquivoEnv() {
  try {
    process.loadEnvFile(); // recurso nativo do Node 20.12+, dispensa a biblioteca dotenv
  } catch {
    // sem .env: usa as variáveis do ambiente (ex.: as configuradas no Render)
  }
}

async function iniciar() {
  carregarArquivoEnv();
  const porta = process.env.PORT || 3000;
  const tipoDeBanco = await iniciarBanco();
  criarApp().listen(porta, () => {
    console.log(`Banco de dados: ${tipoDeBanco}`);
    console.log(`Servidor rodando em http://localhost:${porta}`);
  });
}

iniciar().catch((erro) => {
  console.error("Não foi possível iniciar o servidor:", erro.message);
  process.exit(1);
});
