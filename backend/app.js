// Monta a aplicação Express: API (serviço Web) + arquivos das telas (interface).
// Fica separado de servidor.js para os testes poderem criar a aplicação sem abrir uma porta fixa.

const path = require("node:path");
const express = require("express");
const cors = require("cors");
const fornecedorRotas = require("./rotas/fornecedorRotas");
const produtoRotas = require("./rotas/produtoRotas");
const { rotaNaoEncontrada, tratarErros } = require("./middlewares/tratarErros");

const PASTA_DO_PROJETO = path.join(__dirname, "..");
const TELA_INICIAL = "tela_inicial.html";
const TELAS = ["tela_cadastro.html", "lista-produtos-fornecedores.html"];

// Publica só o que é da interface (as 3 telas, css/ e js/), nunca a pasta do back-end ou o .env.
function servirInterface(app) {
  app.get("/", (req, res) => res.sendFile(path.join(PASTA_DO_PROJETO, TELA_INICIAL)));
  app.get(`/${TELA_INICIAL}`, (req, res) => res.redirect("/"));
  for (const tela of TELAS) {
    app.get(`/${tela}`, (req, res) => res.sendFile(path.join(PASTA_DO_PROJETO, tela)));
  }
  app.use("/css", express.static(path.join(PASTA_DO_PROJETO, "css")));
  app.use("/js", express.static(path.join(PASTA_DO_PROJETO, "js")));
}

function criarApp() {
  const app = express();
  app.use(cors()); // permite abrir as telas por outro endereço (ex.: Live Server na porta 5500)
  app.use(express.json());

  app.use("/fornecedores", fornecedorRotas);
  app.use("/produtos", produtoRotas);
  servirInterface(app);

  app.use(rotaNaoEncontrada);
  app.use(tratarErros);
  return app;
}

module.exports = { criarApp };
