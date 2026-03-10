## 🟢 Rotas Públicas

| Método | Endpoint    | Descrição                                             | Roles                                                                                |
| ------ | ----------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| POST   | `/login`    | Autenticar usuário e gerar token                      | PUBLIC                                                                               |
| POST   | `/purchase` | Realizar compra informando produtos e dados do cartão | PUBLIC (qualquer usuário autenticável ou mesmo sem autenticação dependendo da regra) |

> Observação: se a compra for permitida apenas para usuários cadastrados, adiciona `auth` mas continua público em termos de acesso de roles (USER/FINANCE/ADMIN/…).

---

## 🔒 Rotas Privadas

### 1️⃣ Gateways (Gestão)

| Método | Endpoint                 | Descrição                     | Roles |
| ------ | ------------------------ | ----------------------------- | ----- |
| PATCH  | `/gateways/:id/status`   | Ativar ou desativar gateway   | ADMIN |
| PATCH  | `/gateways/:id/priority` | Alterar prioridade do gateway | ADMIN |

---

### 2️⃣ Usuários (CRUD)

| Método | Endpoint     | Descrição             | Roles          |
| ------ | ------------ | --------------------- | -------------- |
| POST   | `/users`     | Criar novo usuário    | ADMIN          |
| GET    | `/users`     | Listar todos usuários | ADMIN          |
| GET    | `/users/:id` | Detalhar usuário      | ADMIN, MANAGER |
| PUT    | `/users/:id` | Atualizar usuário     | ADMIN          |
| DELETE | `/users/:id` | Remover usuário       | ADMIN          |

---

### 3️⃣ Produtos (CRUD)

| Método | Endpoint        | Descrição             | Roles                         |
| ------ | --------------- | --------------------- | ----------------------------- |
| POST   | `/products`     | Criar produto         | ADMIN, MANAGER                |
| GET    | `/products`     | Listar todos produtos | ADMIN, MANAGER, FINANCE, USER |
| GET    | `/products/:id` | Detalhar produto      | ADMIN, MANAGER, FINANCE, USER |
| PUT    | `/products/:id` | Atualizar produto     | ADMIN, MANAGER                |
| DELETE | `/products/:id` | Remover produto       | ADMIN, MANAGER                |

---

### 4️⃣ Clientes

| Método | Endpoint       | Descrição                          | Roles                   |
| ------ | -------------- | ---------------------------------- | ----------------------- |
| GET    | `/clients`     | Listar todos os clientes           | ADMIN, MANAGER, FINANCE |
| GET    | `/clients/:id` | Detalhe do cliente e todas compras | ADMIN, MANAGER, FINANCE |

---

### 5️⃣ Compras / Transações

| Método | Endpoint                   | Descrição                              | Roles                                                    |
| ------ | -------------------------- | -------------------------------------- | -------------------------------------------------------- |
| GET    | `/transactions`            | Listar todas as transações             | ADMIN, MANAGER, FINANCE                                  |
| GET    | `/transactions/:id`        | Detalhes de uma transação              | ADMIN, MANAGER, FINANCE                                  |
| POST   | `/transactions/:id/refund` | Reembolso de uma transação via gateway | ADMIN, FINANCE                                           |

---

### 🔹 Observações gerais

1. **Autenticação obrigatória (`auth` middleware)** em todas rotas privadas.
2. **Autorização por roles (`role` middleware)** conforme tabela acima.
3. Rotas públicas só precisam de autenticação se o fluxo exigir (ex: `/purchase`).
4. O **refinamento de roles** pode ser feito por controller ou por middleware global, assim você não precisa checar roles manualmente em cada controller.
5. Você pode usar **middleware encadeado**:

```ts
Route.group(() => {
  Route.patch('/gateways/:id/status', 'GatewaysController.toggleStatus')
  Route.patch('/gateways/:id/priority', 'GatewaysController.updatePriority')
}).middleware(['auth', 'role:ADMIN'])
```
