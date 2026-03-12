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
- [ ] GET /users/:id
- [ ] PUT /users/:id
- [ ] DELETE /users/:id

# Products

- [ ] POST /products
- [ ] GET /products
- [ ] GET /products/:id
- [ ] PUT /products/:id
- [ ] DELETE /products/:id

# Clients

- [ ] GET /clients
- [ ] GET /clients/:id

# Transactions

- [ ] GET /transactions
- [ ] GET /transactions/:id
- [ ] POST /transactions/:id/refund

# Health Check

- [x] GET /health (Publica)

# Gateway Failover

- [x] POST /purchase (fallback GW1 → GW2)

# Falha Total de Gateways

- [x] POST /purchase (todos gateways falham)

# Roles e Permissões (comportamento esperado)

- [ ] ADMIN pode acessar todas as rotas privadas
- [ ] MANAGER gerencia usuários e produtos (CRUD completo)
- [ ] FINANCE gerencia produtos (CRUD completo) e pode reembolsar
- [ ] USER não pode acessar rotas de admin/manager/finance

# Autenticação dos Gateways (comportamento esperado)

- [ ] GW1 exige login e usa Bearer token nas transações
- [ ] GW2 exige headers Gateway-Auth-Token e Gateway-Auth-Secret