# Pendencias (Consolidadas) com base no GUIA.md e TODO.md

- Docker Compose completo com app + MySQL + mocks dos gateways.
- Dockerfile da aplicacao e healthcheck do MySQL no compose.
- README completo: requisitos, instalacao, testes, tabela de rotas (auth/roles), variaveis de ambiente e decisoes tecnicas.
- TDD/Japa: criar testes funcionais (auth, users, products, gateways, purchases, transactions).
- Configurar `.env.test` e mockar gateways nos testes.
- Garantir tratamento de erro quando todos os gateways falharem com resposta clara na API.
- Documentar variaveis de ambiente do Gateway 1 (GW1_BASE_URL, GW1_EMAIL, GW1_TOKEN) no README.
