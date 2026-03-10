import router from '@adonisjs/core/services/router'
import PurchasesController from '#controllers/purchases_controller'
import AuthController from '#controllers/auth_controller'
import UsersController from '#controllers/users_controller'
import ProductsController from '#controllers/products_controller'
import GatewaysController from '#controllers/gateways_controller'
import ClientsController from '#controllers/clients_controller'
import TransactionsController from '#controllers/transactions_controller'
import { middleware } from '#start/kernel'

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
  .use([middleware.auth(), middleware.roles(['ADMIN'])])

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
  .use([middleware.auth(), middleware.roles(['ADMIN', 'MANAGER'])])

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
