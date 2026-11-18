# Mercadinho São José: fornecedores e produtos

Trabalho da disciplina **N695 - Desenvolvimento de Plataformas Web** (Unifor), **Equipe 4**.
Cenário escolhido: **Cenário 6, Mercadinho e seus fornecedores**.

Aplicação Web para o gerente do Mercadinho São José cadastrar os **fornecedores** e os **produtos** que cada um entrega, para saber de quem comprar quando um item acaba.

| | |
|---|---|
| Aplicação publicada | _preencher após o deploy (ver [Publicação](#publicação))_ |
| Repositório | https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4 |

---

## Sumário

1. [Visão geral](#visão-geral)
2. [Stack](#stack)
3. [Estrutura do projeto (camadas)](#estrutura-do-projeto-camadas)
4. [Como rodar no seu computador](#como-rodar-no-seu-computador)
5. [Serviço Web (API)](#serviço-web-api)
6. [Persistência dos dados](#persistência-dos-dados)
7. [Regras do Cenário 6 e tratamento de erros](#regras-do-cenário-6-e-tratamento-de-erros)
8. [Clean code](#clean-code)
9. [Testes automáticos](#testes-automáticos)
10. [Publicação](#publicação)
11. [Como contribuir (Git)](#como-contribuir-git)
12. [Links prontos para o PDF](#links-prontos-para-o-pdf)
13. [Registro de alterações](#registro-de-alterações)

---

## Visão geral

**Entidades e relação (1:N):** um **Fornecedor** entrega vários **Produtos**; cada Produto pertence a um único Fornecedor.

| Entidade | Campos |
|---|---|
| Fornecedor | `id`, `nome`, `cnpj` (14 dígitos, único) |
| Produto | `id`, `nome`, `estoque` (inteiro ≥ 0), `fornecedorId` |

**Telas** (mínimas do cenário):

| Tela | Arquivo | O que faz |
|---|---|---|
| Lista de fornecedores | [`tela_inicial.html`](tela_inicial.html) | Lista, leva para edição e para os produtos, exclui (com trava) |
| Cadastro/edição de fornecedor | [`tela_cadastro.html`](tela_cadastro.html) | Sem `?id=` cadastra; com `?id=3` edita o fornecedor 3 |
| Produtos de um fornecedor | [`lista-produtos-fornecedores.html`](lista-produtos-fornecedores.html) | Lista, cadastra, edita e exclui os produtos do fornecedor `?id=` |

**Navegação:** tela inicial → "Novo Fornecedor" / "Editar" → cadastro → volta à lista. Tela inicial → "Cadastrar / Ver produtos" → produtos daquele fornecedor → volta à lista.

## Stack

| Parte | Tecnologia |
|---|---|
| Interface | HTML, CSS e JavaScript puro (sem framework), `fetch` para chamar a API |
| Serviço Web | Node.js 20+ com Express 5 (API REST em JSON) |
| Banco de dados | PostgreSQL (biblioteca `pg`); em produção, [Neon](https://neon.com) (plano gratuito) |
| Hospedagem | [Render](https://render.com) (Web Service gratuito), que serve a API e as telas no mesmo endereço |
| Testes | `node:test` (nativo do Node) + `pg-mem` (PostgreSQL em memória) |

## Estrutura do projeto (camadas)

```
├── tela_inicial.html                    ┐
├── tela_cadastro.html                   │
├── lista-produtos-fornecedores.html     │  INTERFACE (front-end)
├── css/comum.css                        │
├── js/                                  │
│   ├── api.js          ← único lugar do front que chama o back-end (fetch)
│   ├── comum.js        ← funções de tela usadas por todas as páginas
│   ├── validacao.js    ← regras do cenário (validação na tela)
│   └── tela_*.js       ← lógica de cada tela
│                                        ┘
├── backend/                             ┐
│   ├── servidor.js     ← ponto de entrada (npm start)
│   ├── app.js          ← monta o Express: rotas + entrega das telas
│   ├── rotas/          ← camada HTTP: recebe req, chama o serviço, devolve res
│   ├── servicos/       ← SERVIÇO: regras de negócio e validações (não sabe de HTTP nem SQL)
│   ├── dados/          ← DADOS: conexão, esquema.sql e repositórios (único lugar com SQL)
│   └── middlewares/    ← tratamento central de erros
│                                        ┘
├── test/api.test.js    ← testes automáticos da API
├── package.json
└── .env.exemplo        ← modelo do arquivo de configuração (o .env real não vai pro GitHub)
```

O caminho de uma requisição é sempre: **tela → `js/api.js` → rota → serviço → repositório → banco**. Cada camada só conversa com a seguinte.

## Como rodar no seu computador

Pré-requisito: [Node.js](https://nodejs.org) 20.12 ou mais novo (`node -v` para conferir).

```bash
git clone https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4.git
cd Trabalho-Parcial-Desenv-Web-Equipe-4
npm install
npm start
```

Abra **http://localhost:3000**. O servidor entrega as telas e a API no mesmo endereço.

- **Sem configurar nada**, o servidor usa um PostgreSQL **em memória** (os dados somem ao reiniciar). Serve para testar rápido.
- **Para usar o banco de verdade**, copie `.env.exemplo` para `.env` e cole a connection string do Neon em `DATABASE_URL`. Ao iniciar, o terminal mostra qual banco está em uso.
- `npm run dev` reinicia o servidor sozinho a cada arquivo salvo.
- Também dá para abrir as telas pelo Live Server (porta 5500) com o `npm start` rodando: o `js/api.js` detecta isso e chama `http://localhost:3000`.

## Serviço Web (API)

Todas as respostas são JSON. Erros sempre vêm como `{ "mensagem": "texto para o usuário" }`.

### Fornecedores ([`backend/rotas/fornecedorRotas.js`](backend/rotas/fornecedorRotas.js))

| Método | Rota | Corpo | Sucesso | Erros possíveis |
|---|---|---|---|---|
| GET | `/fornecedores` | | 200 + lista | |
| GET | `/fornecedores/:id` | | 200 + fornecedor | 404 |
| POST | `/fornecedores` | `{ "nome", "cnpj" }` | 201 + criado | 400, 409 (CNPJ repetido) |
| PUT | `/fornecedores/:id` | `{ "nome", "cnpj" }` | 200 + atualizado | 400, 404, 409 |
| DELETE | `/fornecedores/:id` | | 204 | 404, 409 (tem produtos) |

### Produtos ([`backend/rotas/produtoRotas.js`](backend/rotas/produtoRotas.js) e rotas aninhadas em `fornecedorRotas.js`)

| Método | Rota | Corpo | Sucesso | Erros possíveis |
|---|---|---|---|---|
| GET | `/fornecedores/:id/produtos` | | 200 + lista do fornecedor | 404 (fornecedor) |
| POST | `/fornecedores/:id/produtos` | `{ "nome", "estoque" }` | 201 + criado | 400, 404 (fornecedor) |
| PUT | `/produtos/:id` | `{ "nome", "estoque" }` | 200 + atualizado | 400, 404 |
| DELETE | `/produtos/:id` | | 204 | 404 |

### Exemplos (para as capturas do PDF)

Dá para testar no navegador (GETs), no Postman/Insomnia ou pelo terminal:

```bash
# cadastrar fornecedor (aceita CNPJ com ou sem pontuação)
curl -X POST http://localhost:3000/fornecedores -H "Content-Type: application/json" \
     -d '{"nome":"Distribuidora Ceará","cnpj":"12.345.678/0001-90"}'
# → 201 {"id":1,"nome":"Distribuidora Ceará","cnpj":"12345678000190"}

# cadastrar produto do fornecedor 1
curl -X POST http://localhost:3000/fornecedores/1/produtos -H "Content-Type: application/json" \
     -d '{"nome":"Arroz 5kg","estoque":10}'
# → 201 {"id":1,"nome":"Arroz 5kg","estoque":10,"fornecedorId":1}

# tentar excluir fornecedor que tem produto
curl -X DELETE http://localhost:3000/fornecedores/1
# → 409 {"mensagem":"Não é possível excluir este fornecedor: ele ainda tem 1 produto cadastrado. Exclua os produtos antes."}
```

Dica para as capturas: no navegador, aperte **F12 → aba Rede (Network)**, faça a ação na tela e clique na requisição para mostrar o pedido e a resposta.

## Persistência dos dados

- **Banco:** PostgreSQL. Tabelas em [`backend/dados/esquema.sql`](backend/dados/esquema.sql), criadas automaticamente quando o servidor inicia (`CREATE TABLE IF NOT EXISTS`, não apaga dados).
- **Relação:** `produtos.fornecedor_id` é chave estrangeira para `fornecedores.id` com `ON DELETE RESTRICT`. Assim, o **próprio banco** recusa excluir fornecedor com produtos, mesmo que alguém pule a regra do serviço.
- **Outras garantias no banco:** `cnpj` com `UNIQUE`, `estoque` com `CHECK (estoque >= 0)`, campos `NOT NULL`.
- **Acesso:** [`backend/dados/conexao.js`](backend/dados/conexao.js) abre a conexão (Pool do `pg`) e expõe `consultar(sql, parametros)`. Os repositórios ([`fornecedorRepositorio.js`](backend/dados/fornecedorRepositorio.js), [`produtoRepositorio.js`](backend/dados/produtoRepositorio.js)) são o único lugar com SQL, sempre com parâmetros `$1, $2`, nunca concatenando texto (isso evita injeção de SQL).

## Regras do Cenário 6 e tratamento de erros

Cada regra é validada **duas vezes**: na tela (resposta rápida ao usuário) e no servidor (não dá para burlar pelo Postman). Algumas também são garantidas pelo banco.

| Regra | Na tela | No serviço | No banco |
|---|---|---|---|
| Campos obrigatórios | [`js/validacao.js`](js/validacao.js) | [`backend/servicos/validacoes.js`](backend/servicos/validacoes.js) | `NOT NULL` |
| CNPJ com 14 dígitos | `validarFornecedor` | `validarCnpj` | `VARCHAR(14)` |
| CNPJ sem repetição (extra) | | `garantirCnpjDisponivel` em [`fornecedorServico.js`](backend/servicos/fornecedorServico.js) | `UNIQUE` |
| Estoque não negativo (e inteiro) | `validarProduto` | `validarEstoque` | `CHECK (estoque >= 0)` |
| Não excluir fornecedor com produtos | `validarExclusaoFornecedor` | `excluir` em `fornecedorServico.js` | `ON DELETE RESTRICT` |

**Como os erros chegam ao usuário:** o serviço lança erros com o status HTTP certo ([`backend/servicos/erros.js`](backend/servicos/erros.js): 400 validação, 404 não encontrado, 409 conflito). O middleware [`backend/middlewares/tratarErros.js`](backend/middlewares/tratarErros.js) transforma qualquer erro em `{ "mensagem": ... }`. O `js/api.js` lê essa mensagem e a tela a mostra na caixa vermelha. Erros inesperados viram 500 com mensagem genérica (o detalhe fica só no log do servidor). Servidor fora do ar mostra "Não foi possível conectar ao servidor".

## Clean code

| Prática | Onde ver |
|---|---|
| Nomes significativos | Funções e variáveis em português descrevendo a intenção: `garantirCnpjDisponivel`, `contarPorFornecedor`, `verificarSePodeExcluir`, `MENSAGEM_NAO_ENCONTRADO` |
| Funções curtas, responsabilidade única | [`backend/servicos/validacoes.js`](backend/servicos/validacoes.js) (uma função por regra), [`backend/rotas/fornecedorRotas.js`](backend/rotas/fornecedorRotas.js) (cada rota tem 1 linha) |
| Separação em camadas | Interface (`*.html`, `js/`) → serviço Web (`backend/rotas`, `backend/servicos`) → dados (`backend/dados`). Ver [estrutura](#estrutura-do-projeto-camadas) |
| Sem código duplicado | [`js/api.js`](js/api.js) centraliza o `fetch`; [`js/comum.js`](js/comum.js) reúne funções das telas; `consultar()` centraliza o acesso ao banco; `tratarErros` centraliza as respostas de erro |

## Testes automáticos

```bash
npm test
```

São 17 testes em [`test/api.test.js`](test/api.test.js) que cobrem o CRUD das duas entidades e todas as regras do cenário. Eles usam o banco em memória, então não precisam de internet. Para rodar contra um PostgreSQL de **testes** (os dados dele são apagados): `DATABASE_URL_TESTE=postgresql://... npm test`.

## Publicação

Banco no **Neon** e aplicação no **Render**, ambos gratuitos e sem cartão de crédito. Precisa ficar no ar **até 10/12**.

### 1. Banco (Neon)

1. Crie uma conta em https://neon.com (dá para entrar com o GitHub).
2. **New Project**: nome `mercadinho`, região mais próxima (ex.: AWS São Paulo, se houver).
3. Em **Connect**, copie a *connection string* (`postgresql://...?sslmode=require`).
4. Para testar localmente, cole em `DATABASE_URL` no seu `.env`. **Nunca** coloque essa string no código nem no GitHub.

### 2. Aplicação (Render)

1. Crie uma conta em https://render.com com o GitHub.
2. **New → Web Service**. O dono do repositório pode conectar a conta do GitHub e escolher o repositório: assim cada `push` na `main` publica sozinho. Quem não é dono pode escolher **Public Git Repository** e colar o link do repositório; nesse modo, depois de cada `push` clique em **Manual Deploy → Deploy latest commit**.
3. Configure:
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
   - **Environment Variables:** `DATABASE_URL` = a connection string do Neon
4. **Create Web Service**. Em ~2 minutos sai o link `https://<nome>.onrender.com`. Coloque esse link no topo deste README e no PDF.

**Atenção:** no plano gratuito, o Render "dorme" o serviço depois de 15 minutos sem acesso, e o primeiro acesso depois disso demora cerca de 1 minuto. Abra o link um pouco antes de apresentar ou de o professor corrigir. Os dados não se perdem, porque ficam no Neon.

Logs do servidor (erros, "Servidor rodando..."): aba **Logs** do serviço no Render.

## Como contribuir (Git)

```bash
git checkout main && git pull                 # sempre começar atualizado
git checkout -b nome-da-tarefa                # uma branch por tarefa
# ... alterações ...
npm test                                      # conferir que nada quebrou
git add .
git commit -m "Descreve o que foi feito (#numero-da-issue)"
git push -u origin nome-da-tarefa
```

Depois abra um **Pull Request** para a `main` no GitHub. Escreva `Closes #N` na descrição para fechar a issue automaticamente.

**Prazo:** só contam commits até **27/11**.

## Links prontos para o PDF

Links absolutos (branch `main`) para colar nas seções 7 a 10 do Modelo de Entrega:

- Rotas de fornecedores: https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4/blob/main/backend/rotas/fornecedorRotas.js
- Rotas de produtos: https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4/blob/main/backend/rotas/produtoRotas.js
- Regras de negócio: https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4/tree/main/backend/servicos
- Validações do servidor: https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4/blob/main/backend/servicos/validacoes.js
- Validações da tela: https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4/blob/main/js/validacao.js
- Tratamento de erros: https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4/blob/main/backend/middlewares/tratarErros.js
- Esquema do banco: https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4/blob/main/backend/dados/esquema.sql
- Acesso ao banco: https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4/tree/main/backend/dados
- Camada de serviço do front: https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4/blob/main/js/api.js
- Testes: https://github.com/Fernandodev0102/Trabalho-Parcial-Desenv-Web-Equipe-4/blob/main/test/api.test.js

> Para apontar uma linha específica, abra o arquivo no GitHub, clique no número da linha (Shift+clique para um intervalo) e copie o endereço. Ele termina em `#L10-L25`.

**Lembrete:** a seção 11 do PDF (declaração de uso de IA generativa) é obrigatória, e não declarar custa 2 pontos para a equipe.

## Registro de alterações

Atualize esta lista a cada entrega relevante (mais recente no topo).

| Data | O que mudou | Issue |
|---|---|---|
| 18/11 | Serviço Web (Express) com CRUD de fornecedores e produtos, persistência em PostgreSQL, validações e tratamento de erros no servidor, testes automáticos, telas servidas pelo back-end, correção de sobras do merge nas telas (linha fixa "Fornecedor 1" e campo de CNPJ duplicado), README completo | ver issues do back-end |
| 18/11 | Ajustes nas telas antes da integração com o back-end | |
| 17/11 | Telas integradas ao serviço Web via `js/api.js` (listar, cadastrar/editar, excluir com trava, produtos do fornecedor) | #2 a #6 |
| 13/11 a 17/11 | Criação e estilização das três telas | |
