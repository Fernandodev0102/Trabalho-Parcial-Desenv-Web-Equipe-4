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
