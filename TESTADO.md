# Autenticação

- [x] POST /login (Publica)

# Compras

- [x] POST /purchase (Publica)
- [x] POST /purchase (valor calculado por múltiplos produtos e quantidades)

# Gateways (ADMIN)

- [x] PATCH /gateways/:id/status
- [x] PATCH /gateways/:id/priority

# Users

- [x] POST /users (ADMIN | MANAGER)
- [x] GET /users (ADMIN | MANAGER)
- [x] GET /users/:id
- [x] PUT /users/:id
- [x] DELETE /users/:id

# Products

- [x] POST /products
- [x] GET /products
- [x] GET /products/:id
- [x] PUT /products/:id
- [x] DELETE /products/:id

# Clients

- [x] GET /clients
- [x] GET /clients/:id

# Transactions

- [x] GET /transactions
- [x] GET /transactions/:id
- [x] POST /transactions/:id/refund

# Health Check

- [x] GET /health (Publica)

# Gateway Failover

- [x] POST /purchase (fallback GW1 → GW2)

# Falha Total de Gateways

- [x] POST /purchase (todos gateways falham)

# Roles e Permissões (comportamento esperado)

- [x] ADMIN pode acessar todas as rotas privadas
- [x] MANAGER gerencia usuários e produtos (CRUD completo)
- [x] FINANCE gerencia produtos (CRUD completo) e pode reembolsar
- [x] USER não pode acessar rotas de admin/manager/finance

# Autenticação dos Gateways (comportamento esperado)

- [x] GW1 exige login e usa Bearer token nas transações
- [x] GW2 exige headers Gateway-Auth-Token e Gateway-Auth-Secret