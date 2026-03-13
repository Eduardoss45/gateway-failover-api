# Revisões Necessárias

## Reset automático dos dados no startup

**Problema:** o `docker-compose` executa `node ace db:seed` em todo start e o `00_reset_seeder` faz `TRUNCATE` das tabelas, apagando usuários criados manualmente.

**Efeito:** dados desaparecem após reinício do container.

**Correção sugerida:** rodar seeds apenas em ambiente de desenvolvimento ou quando uma flag explícita estiver habilitada.

---

## Divergências nos testes (status esperados)

**Problema:** alguns testes estão com status esperados divergentes do comportamento atual da API.

**Correções sugeridas:**

- `/purchase` com produto inexistente: ajustar o teste para esperar **404 (Not Found)** em vez de **500 (Internal Server Error)**.

- `todos gateways falham`: padronizar para **502 (Bad Gateway)** ou ajustar o teste para o status atual **503 (Service Unavailable)**, conforme a semântica definida pela API.

- `refund` sem `gateway_id` ou `external_id`: adicionar validação para retornar **400 (Bad Request)** e ajustar o teste para refletir esse comportamento.