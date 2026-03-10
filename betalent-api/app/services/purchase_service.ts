import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'
import PaymentService from './payment_service.ts'
import db from '@adonisjs/lucid/services/db'

export default class PurchaseService {
  async execute(payload: any) {
    const { name, email, cardNumber, cvv, products } = payload

    const productIds = products.map((p: any) => p.product_id)
    const uniqueProductIds = Array.from(new Set(productIds))

    const dbProducts = await Product.query().whereIn('id', uniqueProductIds)

    if (dbProducts.length !== uniqueProductIds.length) {
      const foundIds = new Set(dbProducts.map((p) => p.id))
      const missingIds = uniqueProductIds.filter((id) => !foundIds.has(id))
      throw new Error(`Products not found: ${missingIds.join(', ')}`)
    }

    let total = 0

    for (const item of products) {
      const product = dbProducts.find((p) => p.id === item.product_id)

      if (!product) {
        throw new Error(`Product ${item.product_id} not found`)
      }

      total += product.amount * item.quantity
    }

    const paymentService = new PaymentService()

    const payment = await paymentService.charge({
      amount: total,
      name,
      email,
      cardNumber,
      cvv,
    })

    return db.transaction(async (trx) => {
      const client = await Client.firstOrCreate({ email }, { name }, { client: trx })

      const transaction = await Transaction.create(
        {
          clientId: client.id,
          gatewayId: payment.gatewayId!,
          externalId: payment.externalId,
          status: payment.success ? 'paid' : 'failed',
          amount: total,
          cardLastNumbers: cardNumber.slice(-4),
        },
        { client: trx }
      )

      const pivotData: Record<number, { quantity: number }> = {}

      for (const item of products) {
        pivotData[item.product_id] = {
          quantity: item.quantity,
        }
      }

      transaction.useTransaction(trx)
      await transaction.related('products').attach(pivotData)

      return transaction
    })
  }
}
