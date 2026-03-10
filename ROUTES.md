# Rotas do Sistema (Requisitos do Desafio Nivel 3)

## Rotas Publicas
- `POST /login` - Realizar login
- `POST /purchase` - Realizar uma compra informando produtos

## Rotas Privadas
- Gateways:
- `PATCH /gateways/:id/status` - Ativar/desativar um gateway
- `PATCH /gateways/:id/priority` - Alterar a prioridade de um gateway

- Usuarios (CRUD):
- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`

- Produtos (CRUD):
- `POST /products`
- `GET /products`
- `GET /products/:id`
- `PUT /products/:id`
- `DELETE /products/:id`

- Clientes:
- `GET /clients` - Listar todos os clientes
- `GET /clients/:id` - Detalhe do cliente e todas suas compras

- Compras/Transacoes:
- `GET /transactions` - Listar todas as compras
- `GET /transactions/:id` - Detalhes de uma compra

- Reembolso:
- `POST /transactions/:id/refund` - Realizar reembolso junto ao gateway (com validacao por role)

## Observacoes
- Todas as rotas privadas devem usar `auth` + `roles` middleware.
