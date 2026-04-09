# gateway-failover-api — Sistema de Pagamentos Multi-Gateway (BeTalent Nível 3)

> Repositório publicado a partir de uma conta secundária do GitHub devido à perda temporária de acesso à conta principal (falha no dispositivo de autenticação de dois fatores).

- [Eduardoss45](https://github.com/Eduardoss45)

Este projeto é a implementação do **desafio técnico BeTalent**, desenvolvido com **AdonisJS 7** e **MySQL**, com suporte a múltiplos usuários e roles, fallback automático entre gateways e testes automatizados.

Ele simula um sistema de compras que integra **múltiplos gateways de pagamento**, seguindo uma ordem de prioridade definida e garantindo persistência de transações e produtos comprados.

---

## ⚙️ Tecnologias e Dependências

- **Node.js 20+ / AdonisJS 7** (`@adonisjs/core` 7, `@adonisjs/auth` 10)
- **MySQL 8+**
- **Docker + Docker Compose**
- **TDD** com **Japa** (`node ace test`)
- **Validação de dados**: VineJS
- **Autenticação e roles**: Adonis Access Tokens (opaque)
- **ORM**: Lucid

---

## ⚙️ Variáveis de Ambiente

O projeto depende das seguintes variáveis:

| Variável       | Descrição                                           | Exemplo                            |
| -------------- | --------------------------------------------------- | ---------------------------------- |
| `DB_HOST`      | Host do MySQL                                       | `localhost`                        |
| `DB_PORT`      | Porta do MySQL                                      | `3306`                             |
| `DB_USER`      | Usuário do banco                                    | `gateway_failover`                 |
| `DB_PASSWORD`  | Senha do banco                                      | `gateway_failover`                 |
| `DB_DATABASE`  | Banco de dados principal                            | `gateway_failover`                 |
| `APP_KEY`      | Chave para criptografia do AdonisJS                 | gerada via `node ace key:generate` |
| `GW1_BASE_URL` | URL base do Gateway 1                               | `http://localhost:3001`            |
| `GW1_EMAIL`    | Email usado para autenticação no Gateway 1          | `dev@gateway-failover.local`       |
| `GW1_TOKEN`    | Token retornado pelo login do Gateway 1             | `FEC9BB078BF338F464F96B48089EB498` |
| `GW2_BASE_URL` | URL base do Gateway 2                               | `http://localhost:3002`            |
| `GW2_TOKEN`    | Token de autenticação usado no Gateway 2            | `tk_f2198cc671b5289fa856`          |
| `GW2_SECRET`   | Secret usado no header de autenticação do Gateway 2 | `3d15e8ed6131446ea7e3456728b1211f` |

### Variável usada apenas pelo Docker Compose

| Variável  | Descrição                                                       | Valores          |
| --------- | --------------------------------------------------------------- | ---------------- |
| `SEED_DB` | Define se os seeds devem ser executados no startup do container | `true` / `false` |

> O banco de teste está configurado em `.env.test` como `DB_DATABASE=app_test`. Não há variável `DB_TEST_DATABASE`.

---

## 🗂 Estrutura do Projeto

```bash
gateway-failover-api/
├── app/
│   ├── controllers/      # Endpoints da API
│   ├── services/         # Lógica de negócio e integração com gateways
│   ├── models/           # Models do ORM Lucid
│   ├── validators/       # Validação de payloads
│   └── middleware/       # Autenticação, roles e fallback
├── database/
│   ├── migrations/       # Criação de tabelas
│   └── seeders/          # Seeds iniciais (admin, gateways, produtos, clientes)
├── start/
│   └── routes.ts         # Registro de rotas públicas e privadas
├── tests/                # Testes unitários e funcionais com Japa
├── Dockerfile
└── docker-compose.yml
```

---

## 🔌 Mocks dos Gateways

### Gateway 1

`http://localhost:3001`

- Autenticação: Bearer token retornado no login (`POST /login`)
- Endpoints:

```
POST /transactions
POST /transactions/:id/charge_back
```

---

### Gateway 2

`http://localhost:3002`

Headers obrigatórios:

```
Gateway-Auth-Token: tk_f2198cc671b5289fa856
Gateway-Auth-Secret: 3d15e8ed6131446ea7e3456728b1211f
```

Endpoints:

```
POST /transacoes
POST /transacoes/reembolso
```

---

### Rodando mocks sem Docker Compose

```bash
docker run -p 3001:3001 -p 3002:3002 matheusprotzen/gateways-mock
```

ou sem autenticação:

```bash
docker run -p 3001:3001 -p 3002:3002 -e REMOVE_AUTH='true' matheusprotzen/gateways-mock
```

---

**API local (padrão)**

```
http://localhost:3333
```

---

## 💳 Fluxo de Compra Multi-Gateway

1. Usuário envia a compra via `/purchase` com produtos e quantidades.
2. Backend calcula o valor total da compra.
3. Tenta processar no **Gateway 1**.
4. Em caso de falha, faz fallback para o **Gateway 2**.
5. Compra aprovada se qualquer gateway retornar sucesso.

Persistência no banco:

**transactions**

- cliente
- gateway utilizado
- status
- amount
- últimos 4 dígitos do cartão
- external_id do gateway

**transaction_products**

- relação entre transação e produtos
- quantidade comprada

---

## 🌐 Rotas da API

### Públicas

| Endpoint    | Método | Descrição               |
| ----------- | ------ | ----------------------- |
| `/login`    | POST   | Autenticação de usuário |
| `/purchase` | POST   | Compra de produtos      |

---

### Privadas (roles)

| Endpoint                   | Método | Roles Permitidos              | Observação                                                              |
| -------------------------- | ------ | ----------------------------- | ----------------------------------------------------------------------- |
| `/gateways/:id/status`     | PATCH  | ADMIN                         | Ativa/desativa gateway                                                  |
| `/gateways/:id/priority`   | PATCH  | ADMIN                         | Altera prioridade do gateway                                            |
| `/users`                   | CRUD   | ADMIN, MANAGER                | Gerencia usuários                                                       |
| `/products`                | CRUD   | ADMIN, MANAGER, FINANCE, USER | Todos podem `GET`, apenas ADMIN/MANAGER/FINANCE podem `POST/PUT/DELETE` |
| `/clients`                 | GET    | ADMIN, MANAGER, FINANCE       | Lista clientes                                                          |
| `/clients/:id`             | GET    | ADMIN, MANAGER, FINANCE       | Detalhes de cliente e compras                                           |
| `/transactions`            | GET    | ADMIN, MANAGER, FINANCE       | Lista todas as transações                                               |
| `/transactions/:id`        | GET    | ADMIN, MANAGER, FINANCE       | Detalhes de uma transação                                               |
| `/transactions/:id/refund` | POST   | ADMIN, FINANCE                | Reembolso via gateway                                                   |

---

## 📚 Documentação da API

A API possui documentação interativa via **Swagger**.

Endpoints disponíveis:

```
/swagger
/docs
```

Essas rotas permitem explorar todos os endpoints da API diretamente no navegador.

---

## 🧪 Testes Automatizados

Os testes usam um banco isolado (`app_test`) definido em `.env.test`.

A inicialização dos testes é gerenciada por `tests/bootstrap.ts`, que:

- cria o banco de testes caso não exista
- executa automaticamente todas as migrations antes da execução

Para rodar os testes:

```bash
node ace test
```

Cobertura atual inclui:

- autenticação
- controle de roles
- CRUD de usuários
- CRUD de produtos
- fluxo de compras
- fallback entre gateways
- reembolsos

---

## 🌱 Seeds Criadas

- Usuário admin
  `admin@admin.com` / `123456`

- Gateways cadastrados
  - Gateway 1 (prioridade 1)
  - Gateway 2 (prioridade 2)

- Produtos de teste

- Clientes de teste

- Transação demo

---

## 🚀 Docker Compose

Serviços incluídos:

- MySQL
- aplicação AdonisJS
- mocks de gateways

Healthcheck:

```
GET /health → 200 OK
```

Subir ambiente completo:

```bash
docker compose up --build
```

---

## 🔧 Observações Técnicas

- Compras públicas sem autenticação (requisito do desafio)
- Validação de payloads com VineJS
- Persistência de transações e produtos relacionada
- Fallback automático entre gateways configurável via prioridade

Estrutura modular:

```
controllers → services → models → validators → middleware
```

Roles implementadas:

- **ADMIN**
- **MANAGER**
- **FINANCE**
- **USER**
