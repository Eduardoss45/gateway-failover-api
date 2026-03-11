# Autenticação

- [ ] POST /login (Publica)

# Compras

- [ ] POST /purchase (Publica)

# Gateways (ADMIN)

- [ ] PATCH /gateways/:id/status
- [ ] PATCH /gateways/:id/priority

# Users

- [ ] POST /users (ADMIN | MANAGER)
- [ ] GET /users (ADMIN | MANAGER)
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

- [ ] GET /health (Publica)

# Gateway Failover

- [ ] POST /purchase (fallback GW1 → GW2)

# Falha Total de Gateways

- [ ] POST /purchase (todos gateways falham)
