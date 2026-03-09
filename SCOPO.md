# Guia de Implementação — Nível 3 BeTalent (AdonisJS + Node.js)

Vou montar um cronograma realista considerando que você está aprendendo AdonisJS do zero.

---

## 🗺️ Visão Geral do Projeto

**Stack:**
- AdonisJS v6 (Node.js)
- MySQL
- Docker Compose
- TDD (Japa — test runner nativo do Adonis)
- Mock dos gateways via Docker

---

## 📅 Cronograma (7–10 dias)

### **Dia 1 — Ambiente e Fundamentos do AdonisJS**

**Objetivo:** Entender o Adonis e ter o ambiente rodando.

**Passos:**
1. Instalar Node.js 20+, Docker Desktop
2. Criar o projeto:
   ```bash
   npm init adonisjs@latest betalent-api -- --kit=api
   cd betalent-api
   ```
3. Ler a documentação de:
   - Routing (`routes.ts`)
   - Controllers
   - Models (Lucid ORM)
4. Criar o `docker-compose.yml` com MySQL + a aplicação
5. Configurar `.env` com as credenciais do banco

**Entregável do dia:** App rodando localmente com MySQL via Docker.

---

### **Dia 2 — Banco de Dados e Migrations**

**Objetivo:** Criar toda a estrutura do banco.

**Passos:**
1. Instalar e configurar Lucid:
   ```bash
   node ace add @adonisjs/lucid
   ```
2. Criar as migrations na ordem correta (respeitar FK):
   - `users` (email, password, role)
   - `gateways` (name, is_active, priority)
   - `clients` (name, email)
   - `products` (name, amount)
   - `transactions` (client_id, gateway_id, external_id, status, amount, card_last_numbers)
   - `transaction_products` (transaction_id, product_id, quantity)
3. Criar os Models com os relacionamentos:
   - User, Gateway, Client, Product, Transaction, TransactionProduct
4. Criar Seeders:
   - 2 gateways pré-cadastrados
   - 1 usuário ADMIN inicial

**Entregável do dia:** `node ace migration:run` sem erros, seeds funcionando.

---

### **Dia 3 — Autenticação e Roles**

**Objetivo:** Login de usuários e middleware de autorização.

**Passos:**
1. Instalar Auth:
   ```bash
   node ace add @adonisjs/auth
   # escolher: Opaque Tokens + Lucid
   ```
2. Criar rota pública `POST /login`
3. Criar middleware de autenticação (`auth`)
4. Criar middleware de roles:
   ```
   middleware/role.ts → verifica se user.role está permitido
   ```
5. Mapear permissões por role:

   | Role | Permissões |
   |------|-----------|
   | ADMIN | Tudo |
   | MANAGER | Produtos + Usuários |
   | FINANCE | Produtos + Reembolso |
   | USER | Compras + clientes |

**Entregável do dia:** Login retornando token, rotas protegidas respondendo 401/403.

---

### **Dia 4 — CRUD de Usuários e Produtos**

**Objetivo:** Rotas privadas básicas com validação por roles.

**Passos:**
1. Instalar VineJS (já vem no Adonis v6):
2. Criar `UsersController` com CRUD completo
3. Criar `ProductsController` com CRUD completo
4. Aplicar validators (VineJS) em cada rota
5. Aplicar middleware de role nas rotas
6. Criar rotas de gateway:
   - `PATCH /gateways/:id/toggle` — ativar/desativar
   - `PATCH /gateways/:id/priority` — alterar prioridade

**Entregável do dia:** CRUD funcionando com bloqueio por role.

---

### **Dia 5 — Integração com os Gateways (núcleo do sistema)**

**Objetivo:** Implementar o sistema multi-gateway modular.

**Passos:**
1. Subir o mock:
   ```bash
   docker run -p 3001:3001 -p 3002:3002 matheusprotzen/gateways-mock
   ```
2. Criar a abstração do gateway em `app/services/gateways/`:
   ```
   GatewayInterface.ts       ← contrato/interface
   Gateway1Service.ts        ← implementação Gateway 1
   Gateway2Service.ts        ← implementação Gateway 2
   GatewayManager.ts         ← orquestra a ordem de prioridade
   ```
3. Lógica do `GatewayManager`:
   - Busca gateways ativos ordenados por prioridade
   - Tenta o 1º → se erro, tenta o 2º
   - Retorna sucesso se qualquer um funcionar
4. Cada `GatewayService` deve:
   - Fazer login e pegar token (Gateway 1)
   - Usar headers fixos (Gateway 2)
   - Mapear os campos para o formato correto de cada gateway

**Entregável do dia:** Conseguir processar uma cobrança via ambos os gateways.

---

### **Dia 6 — Rota de Compra e Transações**

**Objetivo:** Rota pública de compra e rotas de consulta de transações.

**Passos:**
1. Criar rota pública `POST /purchases`:
   - Recebe: dados do cliente, cartão, array de produtos com quantidades
   - Calcula valor total no back-end (produto × quantidade)
   - Salva/encontra o cliente
   - Processa via `GatewayManager`
   - Salva a transação e os `transaction_products`
2. Criar rotas privadas de consulta:
   - `GET /transactions` — lista todas
   - `GET /transactions/:id` — detalhe de uma compra
   - `GET /clients` — lista todos clientes
   - `GET /clients/:id` — cliente com todas suas compras
3. Criar rota de reembolso:
   - `POST /transactions/:id/refund`
   - Chama o gateway correto para estornar
   - Atualiza status da transação

**Entregável do dia:** Fluxo completo de compra e consulta funcionando.

---

### **Dia 7 — TDD (testes com Japa)**

**Objetivo:** Cobrir as principais funcionalidades com testes.

**Passos:**
1. Configurar banco de testes no `.env.test`
2. Criar testes funcionais (feature tests):
   ```
   tests/functional/auth.spec.ts
   tests/functional/users.spec.ts
   tests/functional/products.spec.ts
   tests/functional/gateways.spec.ts
   tests/functional/purchases.spec.ts
   tests/functional/transactions.spec.ts
   ```
3. Mockar as chamadas HTTP aos gateways externos nos testes
4. Rodar:
   ```bash
   node ace test
   ```

**Entregável do dia:** Suite de testes passando com os cenários principais.

---

### **Dia 8 — Docker Compose completo + Mock dos Gateways**

**Objetivo:** Tudo rodando com um único `docker compose up`.

**`docker-compose.yml` deve ter:**
```
services:
  app:        ← AdonisJS
  db:         ← MySQL
  gateway1:   ← mock porta 3001
  gateway2:   ← mock porta 3002
```

**Passos:**
1. Criar `Dockerfile` para a aplicação
2. Ajustar variáveis de ambiente para apontar para os serviços do compose
3. Garantir `healthcheck` no MySQL antes do app subir
4. Testar:
   ```bash
   docker compose up --build
   docker compose exec app node ace migration:run
   docker compose exec app node ace db:seed
   ```

**Entregável do dia:** `docker compose up` → sistema 100% funcional.

---

### **Dia 9 — README + Revisão Final**

**Objetivo:** Documentação e polimento.

**README deve conter:**
- Requisitos (Node, Docker)
- Como instalar e rodar
- Como rodar os testes
- Tabela de rotas com método, path, auth, roles
- Variáveis de ambiente necessárias
- Decisões técnicas relevantes

---

## 🧱 Estrutura de Pastas Sugerida

```
app/
  controllers/
    auth_controller.ts
    users_controller.ts
    products_controller.ts
    gateways_controller.ts
    transactions_controller.ts
    clients_controller.ts
  middleware/
    role_middleware.ts
  models/
    user.ts / gateway.ts / client.ts / product.ts / transaction.ts
  services/
    gateways/
      gateway_interface.ts
      gateway1_service.ts
      gateway2_service.ts
      gateway_manager.ts
  validators/
    user_validator.ts
    product_validator.ts
    purchase_validator.ts
start/
  routes.ts
database/
  migrations/
  seeders/
tests/
  functional/
```

---

## ⚠️ Pontos de Atenção

| Tema | Detalhe |
|------|---------|
| **Senha** | Nunca salvar em texto puro — usar `hash` do Adonis |
| **Cartão** | Salvar apenas os últimos 4 dígitos na transação |
| **Gateway Manager** | Deve ser fácil adicionar um Gateway 3 no futuro |
| **Erros** | Se todos os gateways falharem, retornar erro claro |
| **TDD** | Escreva o teste antes (ou junto) da implementação |

---

Quer começar pelo **Dia 1** agora? Posso te guiar passo a passo na criação do projeto, do `docker-compose.yml` e na configuração inicial do AdonisJS.