-- Esquema do banco do Mercadinho São José (Cenário 6).
-- Relação 1:N: um fornecedor entrega vários produtos; cada produto pertence a um fornecedor.
-- Executado automaticamente quando o servidor inicia (CREATE TABLE IF NOT EXISTS não apaga dados).

CREATE TABLE IF NOT EXISTS fornecedores (
  id    SERIAL PRIMARY KEY,
  nome  VARCHAR(120) NOT NULL,
  cnpj  VARCHAR(14)  NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS produtos (
  id             SERIAL PRIMARY KEY,
  nome           VARCHAR(120) NOT NULL,
  estoque        INTEGER      NOT NULL CHECK (estoque >= 0),
  -- ON DELETE RESTRICT: o próprio banco impede excluir um fornecedor que ainda tem produtos.
  fornecedor_id  INTEGER      NOT NULL REFERENCES fornecedores (id) ON DELETE RESTRICT
);
