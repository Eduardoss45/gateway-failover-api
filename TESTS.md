# Guia de Testes (Plano Completo)

## Objetivo
Garantir 100% de cobertura funcional das rotas e regras do TODO.md, com foco em autenticacao, roles, compras, gateways e reembolso.

## Estrutura de arquivos
- `tests/functional/auth.spec.ts`
- `tests/functional/users.spec.ts`
- `tests/functional/products.spec.ts`
- `tests/functional/gateways.spec.ts`
- `tests/functional/purchases.spec.ts`
- `tests/functional/transactions.spec.ts`
- `tests/helpers/auth.ts`
- `tests/helpers/factories.ts`
- `tests/helpers/gateway_mocks.ts`

## Setup global
- Usar `tests/bootstrap.ts` para subir o servidor HTTP via `testUtils.httpServer().start()`.
- Criar `.env.test` com banco dedicado e variaveis dos gateways apontando para mocks.
- Usar `testUtils.db().truncate()` no `setup/teardown` de cada suite para isolar dados.

## Helpers sugeridos
- `tests/helpers/auth.ts`
  - Funcoes: `loginAsAdmin()`, `loginAsManager()`, `loginAsFinance()`, `loginAsUser()`.
  - Cada funcao deve criar usuario via model e retornar token.
- `tests/helpers/factories.ts`
  - Funcoes: `createGateway`, `createProduct`, `createClient`, `createTransaction`.
  - Deve permitir override de campos.
- `tests/helpers/gateway_mocks.ts`
  - Simular sucesso e falha dos gateways para validar fallback.
  - Pode mockar `axios` ou expor endpoints locais fake.

## Cobertura por rota

### Auth
- `POST /login` deve retornar `token` e `type` com credenciais validas.
- `POST /login` deve retornar 401 com credenciais invalidas.
- Validacao de payload: email invalido e senha curta.

### Purchase (publica)
- `POST /purchase` calcula total com multiplos produtos e quantidades.
- Falha se algum `product_id` nao existir.
- Salva `transaction` com `card_last_numbers` e `status` correto.
- Persistencia do pivot `transaction_products`.
- Fallback: falha no gateway 1 e sucesso no gateway 2.

### Gateways (privado)
- `PATCH /gateways/:id/status` altera `is_active` para ADMIN.
- `PATCH /gateways/:id/priority` altera `priority` para ADMIN.
- Usuarios sem role ADMIN recebem 403.
- Validacao: payload invalido retorna 422.

### Users (privado)
- CRUD completo com ADMIN.
- Validacao de role e payload.
- Garantir que senha e sempre hashed (nao expor no JSON).

### Products (privado)
- CRUD completo com ADMIN/MANAGER.
- Leitura permitida para ADMIN/MANAGER/FINANCE/USER.
- Validacao de payload com VineJS.

### Clients (privado)
- `GET /clients` retorna clientes com transacoes e produtos.
- `GET /clients/:id` retorna detalhes e 404 quando nao existe.
- Roles: ADMIN/MANAGER/FINANCE.

### Transactions (privado)
- `GET /transactions` lista com `client`, `products`, `gateway`.
- `GET /transactions/:id` retorna detalhe completo.
- Roles: ADMIN/MANAGER/FINANCE.

### Refund (privado)
- `POST /transactions/:id/refund` atualiza status para `refunded` em sucesso.
- Falha quando `external_id` ou `gateway_id` esta ausente.
- Roles: ADMIN/FINANCE apenas.

## Cobertura de regras de negocio
- Gateways ativos ordenados por prioridade.
- Se todos gateways falharem, retornar erro padronizado (status 502, code `E_GATEWAY_FAILURE`).
- Cliente deve ser reutilizado por email (nao duplicar).

## Execucao
- Rodar `node ace test` e garantir suite funcional verde.
- Rodar testes localmente com mocks dos gateways para evitar dependencia externa.
