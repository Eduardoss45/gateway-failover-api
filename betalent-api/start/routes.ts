import router from '@adonisjs/core/services/router'
import PurchasesController from '#controllers/purchases_controller'

router.post('/purchase', [PurchasesController, 'store'])
