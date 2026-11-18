// Regras de validação do Cenário 6 (Mercadinho).
// Cada função recebe os dados e devolve a lista de erros; lista vazia = dados válidos.

const QUANTIDADE_DIGITOS_CNPJ = 14;

// Aceita o CNPJ digitado com ou sem pontuação (12.345.678/0001-90 ou 12345678000190).
function removerPontuacaoCnpj(cnpj) {
  return cnpj.replace(/[.\/\-\s]/g, "");
}

function validarFornecedor({ nome, cnpj }) {
  const erros = [];
  if (!nome) {
    erros.push("Informe o nome da empresa.");
  }
  if (!cnpj) {
    erros.push("Informe o CNPJ.");
  } else if (!new RegExp(`^\\d{${QUANTIDADE_DIGITOS_CNPJ}}$`).test(cnpj)) {
    erros.push(`O CNPJ deve ter exatamente ${QUANTIDADE_DIGITOS_CNPJ} dígitos numéricos.`);
  }
  return erros;
}

// `estoque` chega como número, ou null quando o campo foi deixado em branco.
function validarProduto({ nome, estoque }) {
  const erros = [];
  if (!nome) {
    erros.push("Informe o nome do produto.");
  }
  if (estoque === null) {
    erros.push("Informe a quantidade em estoque.");
  } else if (!Number.isInteger(estoque)) {
    erros.push("A quantidade em estoque deve ser um número inteiro.");
  } else if (estoque < 0) {
    erros.push("A quantidade em estoque não pode ser negativa.");
  }
  return erros;
}

// Regra do cenário: um fornecedor que ainda tem produtos não pode ser excluído.
function validarExclusaoFornecedor(produtosDoFornecedor) {
  const quantidade = produtosDoFornecedor.length;
  if (quantidade === 0) {
    return [];
  }
  const descricao = quantidade === 1 ? "1 produto cadastrado" : `${quantidade} produtos cadastrados`;
  return [`Não é possível excluir este fornecedor: ele ainda tem ${descricao}. Exclua os produtos antes.`];
}
