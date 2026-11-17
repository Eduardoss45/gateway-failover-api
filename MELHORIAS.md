# Lista de Melhorias — gateway-failover-api

Análise do projeto (AdonisJS 7 + Lucid + multi-gateway com fallback por prioridade).
Prioridade: **Alta** / **Média** / **Baixa**.

---

## 1. Arquitetura e Design de Código

### 1.1. Injeção de dependência em vez de `new` direto
**Prioridade: Alta**

Hoje vários services e controllers instanciam classes manualmente:

```ts
const purchaseService = new PurchaseService()
const paymentService = new PaymentService()
```

**Problema:** dificulta testes unitários, viola DIP e torna o código mais rígido.

**Sugestão:**
- Registrar services no container do Adonis (`app/providers` ou `start/kernel`).
- Injetar via construtor / `inject()` nos controllers e services.
- Facilitar mocks nos testes (GatewayManager, PaymentService, etc.).

### 1.2. GatewayManager e resolução de gateways
**Prioridade: Alta**

```ts
private gatewayServices: { [key: string]: Gateway1Service | Gateway2Service } = {
  gateway1: new Gateway1Service(),
  gateway2: new Gateway2Service(),
}
```

**Problemas:**
- Hardcoded e não extensível (novo gateway = alteração de código).
- Nome do gateway no banco (`Gateway 1`) é normalizado com `replace(/\s+/g, '').toLowerCase()` — frágil.
- Serviços são instanciados uma vez e mantêm estado (ex.: token do Gateway1).

**Sugestões:**
- Usar um **Factory / Strategy Registry** (mapear `gateway.name` → implementação).
- Ou carregar implementações via container com tags/bindings.
- Extrair a lógica de autenticação do Gateway1 para um método mais robusto (refresh de token, retry).
- Padronizar o identificador do gateway (slug único no model, não só o `name`).

### 1.3. Tratamento de erros inconsistente
**Prioridade: Alta**

- `PurchaseService` usa `Exception` do Adonis e `GatewayException`.
- `RefundService` lança `new Error(...)` genérico.
- Controllers não tratam erros de forma uniforme (dependem do `handler`).

**Sugestão:**
- Criar exceptions de domínio (`TransactionNotFoundException`, `RefundFailedException`, `ProductNotFoundException`, etc.).
- Centralizar no `ExceptionHandler` o mapeamento para status HTTP e payload JSON padronizado.
- Evitar `throw new Error` em services de negócio.

### 1.4. Transação de banco + pagamento
**Prioridade: Alta**

Fluxo atual:
1. Cobra no gateway.
2. Só depois abre `db.transaction` e persiste.

**Problema:** se a persistência falhar após o charge, o dinheiro foi cobrado e não há registro (ou fica inconsistente). Não há compensação/refund automático.

**Sugestões:**
- Considerar **saga / outbox** ou, no mínimo:
  - Persistir a tentativa de transação *antes* do charge (status `pending`).
  - Atualizar para `paid` / `failed` depois.
  - Em caso de falha de persistência após sucesso no gateway → enfileirar refund ou job de reconciliação.
- Garantir idempotência (chave de idempotência no payload da compra).

---

## 2. Gateways e Integração

### 2.1. Token do Gateway1 em memória
**Prioridade: Média**

```ts
private token: string | null = null
// ...
if (this.token) return
```

**Problemas:**
- Token nunca expira (se o mock/gateway real expirar, falha silenciosa até reiniciar o processo).
- Em ambiente multi-instância (vários pods), cada instância tem seu próprio token.

**Sugestão:**
- Tratar 401 e forçar re-login.
- Opcionalmente cachear o token no Redis com TTL.

### 2.2. Lógica de "cartão inválido" hardcoded nos services
**Prioridade: Média**

```ts
if (payload.cvv === '100' || payload.cvv === '200') {
  return { success: false, error: 'Gateway1 invalid card' }
}
```

Isso é regra de negócio do *mock*, não deveria estar no código de produção.

**Sugestão:**
- Remover essas checagens dos services reais.
- Deixar apenas nos testes (mocks de HTTP / nock / msw).
- Ou configurar via env apenas em ambiente de desenvolvimento.

### 2.3. Interface `GatewayInterface` incompleta no uso
**Prioridade: Média**

`GatewayManager` e `RefundService` não usam a interface de forma uniforme (RefundService faz `if/else` no nome).

**Sugestão:**
- Fazer o `GatewayManager` também expor `refund(gateway, externalId)`.
- Ou ter um `resolve(gateway)` que retorna a implementação tipada.

### 2.4. Timeout e resiliência das chamadas HTTP
**Prioridade: Alta**

Axios sem timeout configurado e sem retry.

**Sugestão:**
- Configurar `timeout` (ex.: 5–10s).
- Retry com backoff apenas em erros de rede / 5xx (não em 4xx).
- Circuit breaker simples (ex.: opossum) se o volume justificar.
- Logar latência e status de cada tentativa de gateway.

---

## 3. Segurança

### 3.1. Dados de cartão em texto puro
**Prioridade: Alta**

`cardNumber` e `cvv` trafegam e são usados em memória. Só os 4 últimos dígitos são salvos.

**Sugestões:**
- Nunca logar número de cartão / CVV.
- Validar formato (Luhn) no validator.
- Em produção real, usar tokenização / PCI-compliant provider (nunca processar PAN no backend).
- Documentar claramente que este projeto é **apenas simulação**.

### 3.2. Endpoint `/purchase` público
**Prioridade: Média** (requisito do desafio, mas)

Sem rate limit, sem captcha, sem autenticação.

**Sugestão (pós-desafio):**
- Rate limiting (IP + email).
- Opcional: API key / token de parceiro.
- Validação mais rigorosa de volume e valor.

### 3.3. Secrets no `.env` e no README
**Prioridade: Média**

Tokens de exemplo aparecem no README e no docker-compose.

**Sugestão:**
- Manter apenas placeholders no README.
- Usar secrets do Docker / GitHub Actions em CI.
- Garantir que `.env` nunca seja commitado (já está no `.gitignore` — ok).

### 3.4. Roles e autorização
**Prioridade: Baixa–Média**

Middleware de roles existe e está bem aplicado nas rotas. Bom.

Melhorias possíveis:
- Policies do Adonis (Bouncer) para regras mais finas (ex.: usuário só vê próprias transações).
- Auditoria de ações administrativas (quem alterou prioridade do gateway).

---

## 4. Banco de Dados e Models

### 4.1. Status da transação como string livre
**Prioridade: Média**

```ts
declare status: string
```

**Sugestão:**
- Enum / union type (`'pending' | 'paid' | 'failed' | 'refunded'`).
- Constraint no banco ou validação no model.

### 4.2. Índices e consultas
**Prioridade: Média**

- Índice em `transactions.client_id`, `transactions.gateway_id`, `transactions.external_id`, `transactions.status`.
- Índice em `clients.email` (já deve ser unique — confirmar na migration).

### 4.3. Soft delete / histórico
**Prioridade: Baixa**

Para produtos e usuários, considerar soft delete se o volume de dados justificar.

---

## 5. Testes

### 5.1. Cobertura de testes unitários
**Prioridade: Alta**

Há bons testes funcionais (auth, products, purchases, transactions, gateways). Faltam testes **unitários** isolados de:

- `GatewayManager` (ordem de prioridade, skip de inativos, todos falhando).
- `PurchaseService` (cálculo de total, produtos duplicados, produto inexistente).
- `RefundService`.

**Sugestão:** mockar Axios / services de gateway e testar a lógica de negócio sem HTTP real.

### 5.2. Testes de concorrência e edge cases
**Prioridade: Média**

- Dois requests de compra simultâneos com o mesmo email.
- Gateway ativo/inativo no meio do fluxo.
- Mudança de prioridade durante carga.

### 5.3. Coverage report
**Prioridade: Baixa**

Adicionar `c8` ou `nyc` e publicar coverage no CI.

---

## 6. Observabilidade e Operação

### 6.1. Logs estruturados
**Prioridade: Alta**

Adonis já usa Pino. Melhorar:

- Logar cada tentativa de gateway (gateway, latency, success/fail, externalId).
- Correlation ID (request id) em todas as requisições.
- Nunca logar dados sensíveis (cartão, CVV, tokens).

### 6.2. Métricas e health check
**Prioridade: Média**

`/health` existe e retorna `{ status: 'ok' }` — básico.

**Sugestões:**
- Health mais rico: DB connectivity, latência dos gateways (opcional).
- Métricas Prometheus (contagem de charges por gateway, taxa de fallback, latência p95).

### 6.3. Jobs / filas
**Prioridade: Média** (evolução)

- Job de reconciliação de transações `pending`.
- Notificação de falha de refund.
- Usar BullMQ / Adonis Jobs se o volume crescer.

---

## 7. Docker e DevEx

### 7.1. Dockerfile
**Prioridade: Média**

- Multi-stage build (deps → build → runtime) para imagem menor e mais segura.
- Usuário non-root.
- `NODE_ENV=production` no stage final.
- Cache de layers (`npm ci` antes do COPY do código).

### 7.2. docker-compose
**Prioridade: Baixa–Média**

- `version: "3.8"` está deprecated em Compose V2 (pode remover).
- Separar profiles (`dev`, `test`) se necessário.
- Volume nomeado ok; considerar healthcheck mais robusto da app (já existe).

### 7.3. Scripts e documentação
**Prioridade: Baixa**

- Script `make up` / `make test` para onboarding mais rápido.
- Seção no README sobre como rodar apenas os mocks + app local sem Docker completo.

---

## 8. API e Contrato

### 8.1. Respostas padronizadas
**Prioridade: Média**

Padronizar envelope de erro:

```json
{
  "error": {
    "code": "E_GATEWAY_FAILURE",
    "message": "All gateways failed",
    "details": []
  }
}
```

### 8.2. Paginação e filtros
**Prioridade: Média**

`GET /transactions` e `GET /clients` — adicionar paginação (`page`, `perPage`) e filtros (status, date range, client_id).

### 8.3. Versionamento de API
**Prioridade: Baixa**

Prefixo `/api/v1` se o projeto for evoluir além do desafio.

### 8.4. Swagger
**Prioridade: Baixa**

Já existe `adonis-autoswagger`. Garantir que todos os endpoints e schemas de request/response estejam documentados e atualizados.

---

## 9. Qualidade de Código e DX

### 9.1. Tipagem mais forte
**Prioridade: Média**

- Evitar `payload: any` em `PurchaseService.execute`.
- Usar o tipo inferido do Vine validator.
- Tipar retornos dos services.

### 9.2. Constantes e enums
**Prioridade: Baixa**

- Roles já estão em `app/constants/roles.ts` — bom.
- Extrair status de transação, nomes de gateways, códigos de erro para constants/enums.

### 9.3. CI/CD
**Prioridade: Alta**

Não há workflow GitHub Actions visível.

**Sugestão mínima:**
- `lint` + `typecheck` + `test` em PRs.
- Build da imagem Docker opcional.
- Cache de `node_modules` / `npm`.

---

## 10. Roadmap sugerido (ordem prática)

| Ordem | Item | Impacto |
|-------|------|--------|
| 1 | Exceptions de domínio + handler padronizado | Confiabilidade e DX |
| 2 | DI / container para services | Testabilidade |
| 3 | Timeout + logs de gateway + correlation id | Operação |
| 4 | Persistência `pending` antes do charge + reconciliação | Consistência financeira |
| 5 | Testes unitários do GatewayManager e PurchaseService | Confiança |
| 6 | Multi-stage Dockerfile + CI básico | Deploy e qualidade |
| 7 | Paginação / filtros na listagem | Produto |
| 8 | Registry de gateways extensível | Extensibilidade |

---

## Resumo rápido do que já está bom

- Separação controllers → services → models.
- Fallback por prioridade e gateways ativos.
- Roles e middleware de autenticação bem aplicados.
- Docker Compose completo (MySQL + app + mocks).
- Testes funcionais cobrindo o fluxo principal do desafio.
- Swagger e health check presentes.
- Validação com VineJS.

O projeto cumpre bem o desafio técnico. As melhorias acima elevam o nível para produção e manutenção de longo prazo.
