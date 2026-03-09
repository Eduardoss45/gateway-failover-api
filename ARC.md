# Arquitetura sugerida

```bash
betalent-api/
├── app/
│   ├── controllers/
│   │   ├── auth_controller.ts
│   │   ├── users_controller.ts
│   │   ├── products_controller.ts
│   │   ├── gateways_controller.ts
│   │   ├── clients_controller.ts
│   │   ├── transactions_controller.ts
│   │   └── purchases_controller.ts
│   ├── middleware/
│   │   └── role_middleware.ts
│   ├── models/
│   │   ├── user.ts
│   │   ├── gateway.ts
│   │   ├── client.ts
│   │   ├── product.ts
│   │   ├── transaction.ts
│   │   └── transaction_product.ts
│   ├── services/
│   │   ├── gateways/
│   │   │   ├── gateway_interface.ts
│   │   │   ├── gateway1_service.ts
│   │   │   ├── gateway2_service.ts
│   │   │   └── gateway_manager.ts
│   │   ├── purchase_service.ts
│   │   └── refund_service.ts
│   ├── validators/
│   │   ├── auth_validator.ts
│   │   ├── user_validator.ts
│   │   ├── product_validator.ts
│   │   ├── purchase_validator.ts
│   │   └── gateway_validator.ts
│   └── exceptions/
│       ├── gateway_exception.ts
│       └── unauthorized_exception.ts
├── database/
│   ├── migrations/
│   │   ├── 1_create_users_table.ts
│   │   ├── 2_create_gateways_table.ts
│   │   ├── 3_create_clients_table.ts
│   │   ├── 4_create_products_table.ts
│   │   ├── 5_create_transactions_table.ts
│   │   └── 6_create_transaction_products_table.ts
│   └── seeders/
│       ├── 1_admin_seeder.ts
│       └── 2_gateway_seeder.ts
├── start/
│   ├── routes.ts
│   └── kernel.ts
├── config/
│   ├── auth.ts
│   └── database.ts
├── tests/
│   ├── functional/
│   │   ├── auth.spec.ts
│   │   ├── users.spec.ts
│   │   ├── products.spec.ts
│   │   ├── gateways.spec.ts
│   │   ├── purchases.spec.ts
│   │   └── transactions.spec.ts
│   └── bootstrap.ts
├── docker/
│   └── wait-for-db.sh
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── .env
```
