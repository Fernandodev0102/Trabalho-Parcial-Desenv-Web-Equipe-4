// Testes automáticos do serviço Web (rodar com `npm test`).
// Usam o banco em memória, então não precisam de internet nem de PostgreSQL instalado.

const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { criarApp } = require("../backend/app");
const { iniciarBanco, encerrarBanco, consultar } = require("../backend/dados/conexao");

let servidor;
let enderecoBase;

async function requisitar(metodo, caminho, corpo) {
  const opcoes = { method: metodo, headers: { "Content-Type": "application/json" } };
  if (corpo !== undefined) opcoes.body = typeof corpo === "string" ? corpo : JSON.stringify(corpo);
  const resposta = await fetch(enderecoBase + caminho, opcoes);
  const texto = await resposta.text();
  return { status: resposta.status, corpo: texto ? JSON.parse(texto) : null };
}

async function criarFornecedor(dados = { nome: "Distribuidora Ceará", cnpj: "12345678000190" }) {
  return (await requisitar("POST", "/fornecedores", dados)).corpo;
}

async function criarProduto(idFornecedor, dados = { nome: "Arroz 5kg", estoque: 10 }) {
  return (await requisitar("POST", `/fornecedores/${idFornecedor}/produtos`, dados)).corpo;
}

before(async () => {
  // Por padrão usa o banco em memória. Para testar num PostgreSQL de testes (os dados dele são apagados!):
  // DATABASE_URL_TESTE=postgresql://... npm test
  await iniciarBanco(process.env.DATABASE_URL_TESTE || null);
  servidor = criarApp().listen(0);
  enderecoBase = `http://localhost:${servidor.address().port}`;
});

after(async () => {
  servidor.close();
  await encerrarBanco();
});

beforeEach(async () => {
  await consultar("DELETE FROM produtos");
  await consultar("DELETE FROM fornecedores");
});

describe("Fornecedores", () => {
  it("cadastra, lista, busca, edita e exclui um fornecedor", async () => {
    const criado = await requisitar("POST", "/fornecedores", { nome: "Laticínios Sol", cnpj: "11222333000144" });
    assert.equal(criado.status, 201);
    assert.equal(criado.corpo.nome, "Laticínios Sol");

    const lista = await requisitar("GET", "/fornecedores");
    assert.deepEqual(lista.corpo, [criado.corpo]);

    const buscado = await requisitar("GET", `/fornecedores/${criado.corpo.id}`);
    assert.deepEqual(buscado.corpo, criado.corpo);

    const editado = await requisitar("PUT", `/fornecedores/${criado.corpo.id}`, {
      nome: "Laticínios Sol LTDA",
      cnpj: "11222333000144",
    });
    assert.equal(editado.status, 200);
    assert.equal(editado.corpo.nome, "Laticínios Sol LTDA");

    const excluido = await requisitar("DELETE", `/fornecedores/${criado.corpo.id}`);
    assert.equal(excluido.status, 204);
    assert.deepEqual((await requisitar("GET", "/fornecedores")).corpo, []);
  });

  it("aceita CNPJ com pontuação e guarda só os 14 dígitos", async () => {
    const criado = await criarFornecedor({ nome: "Frios Norte", cnpj: "12.345.678/0001-90" });
    assert.equal(criado.cnpj, "12345678000190");
  });

  it("rejeita campos obrigatórios vazios", async () => {
    const resposta = await requisitar("POST", "/fornecedores", { nome: "  ", cnpj: "" });
    assert.equal(resposta.status, 400);
    assert.match(resposta.corpo.mensagem, /Informe o nome da empresa/);
    assert.match(resposta.corpo.mensagem, /Informe o CNPJ/);
  });

  it("rejeita CNPJ que não tem 14 dígitos", async () => {
    for (const cnpj of ["123", "123456789012345", "1234567800019A"]) {
      const resposta = await requisitar("POST", "/fornecedores", { nome: "Teste", cnpj });
      assert.equal(resposta.status, 400, `CNPJ ${cnpj} deveria ser rejeitado`);
      assert.match(resposta.corpo.mensagem, /14 dígitos/);
    }
  });

  it("não permite dois fornecedores com o mesmo CNPJ", async () => {
    await criarFornecedor();
    const resposta = await requisitar("POST", "/fornecedores", { nome: "Outro", cnpj: "12345678000190" });
    assert.equal(resposta.status, 409);
  });

  it("deixa o fornecedor manter o próprio CNPJ ao editar", async () => {
    const fornecedor = await criarFornecedor();
    const resposta = await requisitar("PUT", `/fornecedores/${fornecedor.id}`, { ...fornecedor, nome: "Novo nome" });
    assert.equal(resposta.status, 200);
  });

  it("impede excluir fornecedor que ainda tem produtos", async () => {
    const fornecedor = await criarFornecedor();
    await criarProduto(fornecedor.id);
    const resposta = await requisitar("DELETE", `/fornecedores/${fornecedor.id}`);
    assert.equal(resposta.status, 409);
    assert.match(resposta.corpo.mensagem, /ainda tem 1 produto/);
  });

  it("responde 404 para fornecedor inexistente ou id inválido", async () => {
    for (const id of ["999", "abc", "-1", "1.5"]) {
      const resposta = await requisitar("GET", `/fornecedores/${id}`);
      assert.equal(resposta.status, 404, `id ${id}`);
      assert.equal(resposta.corpo.mensagem, "Fornecedor não encontrado.");
    }
  });
});

describe("Produtos", () => {
  it("cadastra, lista, edita e exclui produtos de um fornecedor", async () => {
    const fornecedor = await criarFornecedor();
    const criado = await requisitar("POST", `/fornecedores/${fornecedor.id}/produtos`, { nome: "Feijão", estoque: 0 });
    assert.equal(criado.status, 201);
    assert.equal(criado.corpo.fornecedorId, fornecedor.id);

    const editado = await requisitar("PUT", `/produtos/${criado.corpo.id}`, { nome: "Feijão 1kg", estoque: 25 });
    assert.equal(editado.corpo.estoque, 25);

    const lista = await requisitar("GET", `/fornecedores/${fornecedor.id}/produtos`);
    assert.deepEqual(lista.corpo, [editado.corpo]);

    assert.equal((await requisitar("DELETE", `/produtos/${criado.corpo.id}`)).status, 204);
    assert.deepEqual((await requisitar("GET", `/fornecedores/${fornecedor.id}/produtos`)).corpo, []);
  });

  it("lista apenas os produtos do fornecedor escolhido", async () => {
    const fornecedorA = await criarFornecedor({ nome: "A", cnpj: "11111111111111" });
    const fornecedorB = await criarFornecedor({ nome: "B", cnpj: "22222222222222" });
    await criarProduto(fornecedorA.id, { nome: "Do A", estoque: 1 });
    await criarProduto(fornecedorB.id, { nome: "Do B", estoque: 1 });
    const lista = await requisitar("GET", `/fornecedores/${fornecedorA.id}/produtos`);
    assert.deepEqual(lista.corpo.map((produto) => produto.nome), ["Do A"]);
  });

  it("rejeita estoque negativo, decimal ou ausente", async () => {
    const fornecedor = await criarFornecedor();
    const casos = [
      [{ nome: "X", estoque: -1 }, /não pode ser negativa/],
      [{ nome: "X", estoque: 2.5 }, /número inteiro/],
      [{ nome: "X", estoque: "10" }, /número inteiro/],
      [{ nome: "X" }, /Informe a quantidade/],
      [{ nome: "", estoque: 1 }, /Informe o nome do produto/],
    ];
    for (const [dados, mensagemEsperada] of casos) {
      const resposta = await requisitar("POST", `/fornecedores/${fornecedor.id}/produtos`, dados);
      assert.equal(resposta.status, 400, JSON.stringify(dados));
      assert.match(resposta.corpo.mensagem, mensagemEsperada);
    }
  });

  it("não cadastra produto em fornecedor inexistente", async () => {
    const resposta = await requisitar("POST", "/fornecedores/999/produtos", { nome: "X", estoque: 1 });
    assert.equal(resposta.status, 404);
  });

  it("responde 404 ao editar ou excluir produto inexistente", async () => {
    assert.equal((await requisitar("PUT", "/produtos/999", { nome: "X", estoque: 1 })).status, 404);
    assert.equal((await requisitar("DELETE", "/produtos/999")).status, 404);
  });
});

describe("Banco de dados e erros gerais", () => {
  it("o próprio banco bloqueia excluir fornecedor com produtos (ON DELETE RESTRICT)", async () => {
    const fornecedor = await criarFornecedor();
    await criarProduto(fornecedor.id);
    await assert.rejects(consultar("DELETE FROM fornecedores WHERE id = $1", [fornecedor.id]));
  });

  it("responde 400 para JSON malformado", async () => {
    const resposta = await requisitar("POST", "/fornecedores", "{nome:");
    assert.equal(resposta.status, 400);
  });

  it("responde 404 com mensagem para rota inexistente", async () => {
    const resposta = await requisitar("GET", "/rota-que-nao-existe");
    assert.equal(resposta.status, 404);
    assert.match(resposta.corpo.mensagem, /Rota não encontrada/);
  });

  it("entrega a tela inicial na raiz e redireciona o nome do arquivo para a raiz", async () => {
    const raiz = await fetch(enderecoBase + "/");
    assert.equal(raiz.status, 200);
    assert.equal(raiz.redirected, false);
    assert.match(await raiz.text(), /<title>Tabela de fornecedores cadastrados<\/title>/);

    const arquivo = await fetch(enderecoBase + "/tela_inicial.html", { redirect: "manual" });
    assert.equal(arquivo.status, 302);
    assert.equal(arquivo.headers.get("location"), "/");
  });

  it("entrega as telas, mas não expõe os arquivos do back-end", async () => {
    assert.equal((await fetch(enderecoBase + "/tela_cadastro.html")).status, 200);
    assert.equal((await fetch(enderecoBase + "/js/api.js")).status, 200);
    assert.equal((await fetch(enderecoBase + "/backend/app.js")).status, 404);
    assert.equal((await fetch(enderecoBase + "/package.json")).status, 404);
  });
});
