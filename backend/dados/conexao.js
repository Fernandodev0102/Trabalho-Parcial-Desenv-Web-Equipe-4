// Conexão com o banco de dados PostgreSQL.
// - Com a variável DATABASE_URL definida (produção e .env): conecta no PostgreSQL de verdade.
// - Sem DATABASE_URL: usa um PostgreSQL em memória (pg-mem), só para testar o projeto
//   sem instalar nada. Nesse modo os dados somem quando o servidor é reiniciado.

const fs = require("node:fs");
const path = require("node:path");

const CAMINHO_ESQUEMA = path.join(__dirname, "esquema.sql");

let pool = null;

function criarPoolEmMemoria() {
  const { newDb } = require("pg-mem");
  const { Pool } = newDb().adapters.createPg();
  return new Pool();
}

function criarPoolPostgres(urlDoBanco) {
  const { Pool } = require("pg");
  return new Pool({ connectionString: urlDoBanco });
}

async function iniciarBanco(urlDoBanco = process.env.DATABASE_URL) {
  pool = urlDoBanco ? criarPoolPostgres(urlDoBanco) : criarPoolEmMemoria();
  await pool.query(fs.readFileSync(CAMINHO_ESQUEMA, "utf8"));
  return urlDoBanco ? "PostgreSQL" : "PostgreSQL em memória (pg-mem)";
}

// Executa um comando SQL com parâmetros ($1, $2...) e devolve as linhas.
// Os parâmetros nunca são concatenados no SQL, o que evita injeção de SQL.
async function consultar(sql, parametros = []) {
  const resultado = await pool.query(sql, parametros);
  return resultado.rows;
}

async function encerrarBanco() {
  if (pool) await pool.end();
  pool = null;
}

module.exports = { iniciarBanco, consultar, encerrarBanco };
