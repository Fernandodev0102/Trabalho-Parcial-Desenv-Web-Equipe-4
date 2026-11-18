// Camada de rotas (HTTP): só traduz requisição -> serviço -> resposta.
// Regras de negócio ficam em servicos/; erros lançados lá chegam ao middleware tratarErros.

const { Router } = require("express");
const fornecedorServico = require("../servicos/fornecedorServico");
const produtoServico = require("../servicos/produtoServico");

const rotas = Router();

rotas.get("/", async (req, res) => {
  res.json(await fornecedorServico.listar());
});

rotas.get("/:id", async (req, res) => {
  res.json(await fornecedorServico.buscar(req.params.id));
});

rotas.post("/", async (req, res) => {
  res.status(201).json(await fornecedorServico.criar(req.body));
});

rotas.put("/:id", async (req, res) => {
  res.json(await fornecedorServico.atualizar(req.params.id, req.body));
});

rotas.delete("/:id", async (req, res) => {
  await fornecedorServico.excluir(req.params.id);
  res.status(204).end();
});

// Produtos de um fornecedor: a URL já deixa clara a relação 1:N.
rotas.get("/:id/produtos", async (req, res) => {
  res.json(await produtoServico.listarDoFornecedor(req.params.id));
});

rotas.post("/:id/produtos", async (req, res) => {
  res.status(201).json(await produtoServico.criar(req.params.id, req.body));
});

module.exports = rotas;
