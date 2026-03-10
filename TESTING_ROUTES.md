# Testes Manuais por Rota (Checklist)

- **POST /login** (Publica)
  - Payload:
    ```json
    {
      "email": "admin@admin.com",
      "password": "123456"
    }
    ```
  - Esperado: `200` com `{ "token": "...", "type": "bearer" }`

- **POST /purchase** (Publica)
  - Payload:
    ```json
    {
      "name": "Cliente Manual",
      "email": "cliente.manual@example.com",
      "cardNumber": "5569000000006063",
      "cvv": "010",
      "products": [
        { "product_id": 1, "quantity": 2 },
        { "product_id": 2, "quantity": 1 }
      ]
    }
    ```
  - Esperado: `201` com `status: "paid"`, `amount` calculado e `gatewayId`

- **PATCH /gateways/:id/status** (Privada, ADMIN)
  - Header: `Authorization: Bearer <token_admin>`
  - Payload:
    ```json
    { "is_active": false }
    ```
  - Esperado: `200` com gateway atualizado

- **PATCH /gateways/:id/priority** (Privada, ADMIN)
  - Header: `Authorization: Bearer <token_admin>`
  - Payload:
    ```json
    { "priority": 1 }
    ```
  - Esperado: `200` com gateway atualizado

- **POST /users** (Privada, ADMIN|MANAGER)
  - Header: `Authorization: Bearer <token_admin_or_manager>`
  - Payload:
    ```json
    {
      "email": "user.manual@example.com",
      "password": "123456",
      "role": "USER"
    }
    ```
  - Esperado: `200` com usuario criado

- **GET /users** (Privada, ADMIN|MANAGER)
  - Header: `Authorization: Bearer <token_admin_or_manager>`
  - Esperado: `200` lista de usuarios

- **GET /users/:id** (Privada, ADMIN|MANAGER)
  - Header: `Authorization: Bearer <token_admin_or_manager>`
  - Esperado: `200` usuario

- **PUT /users/:id** (Privada, ADMIN|MANAGER)
  - Header: `Authorization: Bearer <token_admin_or_manager>`
  - Payload:
    ```json
    {
      "email": "user.manual.updated@example.com",
      "role": "FINANCE"
    }
    ```
  - Esperado: `200` com usuario atualizado

- **DELETE /users/:id** (Privada, ADMIN|MANAGER)
  - Header: `Authorization: Bearer <token_admin_or_manager>`
  - Esperado: `200` com confirmacao de exclusao

- **POST /products** (Privada, ADMIN|MANAGER|FINANCE)
  - Header: `Authorization: Bearer <token_admin_or_manager_or_finance>`
  - Payload:
    ```json
    { "name": "Produto Manual", "amount": 1500 }
    ```
  - Esperado: `200` com produto criado

- **GET /products** (Privada, ADMIN|MANAGER|FINANCE|USER)
  - Header: `Authorization: Bearer <token>`
  - Esperado: `200` lista de produtos

- **GET /products/:id** (Privada, ADMIN|MANAGER|FINANCE|USER)
  - Header: `Authorization: Bearer <token>`
  - Esperado: `200` produto

- **PUT /products/:id** (Privada, ADMIN|MANAGER|FINANCE)
  - Header: `Authorization: Bearer <token_admin_or_manager_or_finance>`
  - Payload:
    ```json
    { "name": "Produto Manual Atualizado", "amount": 2000 }
    ```
  - Esperado: `200` produto atualizado

- **DELETE /products/:id** (Privada, ADMIN|MANAGER|FINANCE)
  - Header: `Authorization: Bearer <token_admin_or_manager_or_finance>`
  - Esperado: `200` confirmacao de exclusao

- **GET /clients** (Privada, ADMIN|MANAGER|FINANCE)
  - Header: `Authorization: Bearer <token_admin_or_manager_or_finance>`
  - Esperado: `200` lista de clientes

- **GET /clients/:id** (Privada, ADMIN|MANAGER|FINANCE)
  - Header: `Authorization: Bearer <token_admin_or_manager_or_finance>`
  - Esperado: `200` cliente com compras

- **GET /transactions** (Privada, ADMIN|MANAGER|FINANCE)
  - Header: `Authorization: Bearer <token_admin_or_manager_or_finance>`
  - Esperado: `200` lista de transacoes

- **GET /transactions/:id** (Privada, ADMIN|MANAGER|FINANCE)
  - Header: `Authorization: Bearer <token_admin_or_manager_or_finance>`
  - Esperado: `200` transacao detalhada

- **POST /transactions/:id/refund** (Privada, ADMIN|FINANCE)
  - Header: `Authorization: Bearer <token_admin_or_finance>`
  - Payload: `{}` (sem body)
  - Esperado: `200` com mensagem de reembolso

- **GET /health** (Publica)
  - Esperado: `200` com `{ "status": "ok" }`
