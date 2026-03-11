import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import { middleware } from '#start/kernel'

const PurchasesController = () => import('#controllers/purchases_controller')
const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const ProductsController = () => import('#controllers/products_controller')
const GatewaysController = () => import('#controllers/gateways_controller')
const ClientsController = () => import('#controllers/clients_controller')
const TransactionsController = () => import('#controllers/transactions_controller')

router.get('/health', () => ({ status: 'ok' }))
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

// Public
router.post('/purchase', [PurchasesController, 'store'])
router.post('/login', [AuthController, 'login'])

// Private
router
  .group(() => {
    router.post('/users', [UsersController, 'store'])
    router.get('/users', [UsersController, 'index'])
    router.get('/users/:id', [UsersController, 'show'])
    router.put('/users/:id', [UsersController, 'update'])
    router.delete('/users/:id', [UsersController, 'destroy'])
  })
  .use([middleware.auth(), middleware.roles(['ADMIN', 'MANAGER'])])

router
  .group(() => {
    router.get('/products', [ProductsController, 'index'])
    router.get('/products/:id', [ProductsController, 'show'])
  })
  .use([middleware.auth(), middleware.roles(['ADMIN', 'MANAGER', 'FINANCE', 'USER'])])

router
  .group(() => {
    router.post('/products', [ProductsController, 'store'])
    router.put('/products/:id', [ProductsController, 'update'])
    router.delete('/products/:id', [ProductsController, 'destroy'])
  })
  .use([middleware.auth(), middleware.roles(['ADMIN', 'MANAGER', 'FINANCE'])])

router
  .group(() => {
    router.patch('/gateways/:id/status', [GatewaysController, 'updateStatus'])
    router.patch('/gateways/:id/priority', [GatewaysController, 'updatePriority'])
  })
  .use([middleware.auth(), middleware.roles(['ADMIN'])])

router
  .group(() => {
    router.get('/clients', [ClientsController, 'index'])
    router.get('/clients/:id', [ClientsController, 'show'])
  })
  .use([middleware.auth(), middleware.roles(['ADMIN', 'MANAGER', 'FINANCE'])])

router
  .group(() => {
    router.get('/transactions', [TransactionsController, 'index'])
    router.get('/transactions/:id', [TransactionsController, 'show'])
  })
  .use([middleware.auth(), middleware.roles(['ADMIN', 'MANAGER', 'FINANCE'])])

router
  .group(() => {
    router.post('/transactions/:id/refund', [TransactionsController, 'refund'])
  })
  .use([middleware.auth(), middleware.roles(['ADMIN', 'FINANCE'])])
