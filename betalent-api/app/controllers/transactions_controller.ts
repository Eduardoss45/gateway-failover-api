import Transaction from '#models/transaction'
import type { HttpContext } from '@adonisjs/core/http'
import PurchaseService from '#services/purchase_service'
import { purchaseValidator } from '#validators/purchase_validator'
import RefundService from '#services/refund_service'

export default class TransactionsController {
  async index() {
    return Transaction.query().preload('products').preload('client').preload('gateway')
  }

  async show({ params, response }: HttpContext) {
    const transaction = await Transaction.query()
      .where('id', params.id)
      .preload('products')
      .preload('client')
      .preload('gateway')
      .first()

    if (!transaction) return response.notFound({ message: 'Transaction not found' })
    return transaction
  }

  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(purchaseValidator)
    const purchaseService = new PurchaseService()
    return purchaseService.execute(payload)
  }

  async refund({ params, response }: HttpContext) {
    const refundService = new RefundService()
    try {
      await refundService.execute(params.id)
      return { message: 'Refund successful' }
    } catch (err: any) {
      return response.badRequest({ message: err.message })
    }
  }
}
