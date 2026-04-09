import type { HttpContext } from '@adonisjs/core/http'
import { purchaseValidator } from '#validators/purchase_validator'
import PurchaseService from '#services/purchase_service'

export default class PurchasesController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(purchaseValidator)

    const purchaseService = new PurchaseService()

    const transaction = await purchaseService.execute(payload)

    return response.created(transaction)
  }
}
