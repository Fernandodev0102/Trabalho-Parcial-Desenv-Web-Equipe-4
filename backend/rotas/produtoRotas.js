// Rotas de um produto específico (editar e excluir).
// Listar e cadastrar ficam em fornecedorRotas.js, porque dependem do fornecedor.

const { Router } = require("express");
const produtoServico = require("../servicos/produtoServico");

const rotas = Router();

rotas.put("/:id", async (req, res) => {
  res.json(await produtoServico.atualizar(req.params.id, req.body));
});

rotas.delete("/:id", async (req, res) => {
  await produtoServico.excluir(req.params.id);
  res.status(204).end();
});

module.exports = rotas;
