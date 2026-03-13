import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'
import PaymentService from './payment_service.ts'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'
import GatewayException from '#exceptions/gateway_exception'

export default class PurchaseService {
  async execute(payload: any) {
    const { name, email, cardNumber, cvv, products } = payload

    const seen = new Set<number>()

    for (const item of products) {
      const id = Number(item.product_id)

      if (seen.has(id)) {
        throw new Exception('Duplicate products are not allowed', {
          status: 422,
          code: 'E_DUPLICATE_PRODUCTS',
        })
      }

      seen.add(id)
    }

    const productIds = products
      .map((p: any) => Number(p.product_id))
      .filter((id: number) => Number.isFinite(id))
    const uniqueProductIds = Array.from(new Set<number>(productIds))

    const dbProducts = await Product.query().whereIn('id', uniqueProductIds)

    if (dbProducts.length !== uniqueProductIds.length) {
      const foundIds = new Set(dbProducts.map((p) => p.id))
      const missingIds = uniqueProductIds.filter((id) => !foundIds.has(id))
      throw new Exception(`Products not found: ${missingIds.join(', ')}`, {
        status: 404,
        code: 'E_PRODUCTS_NOT_FOUND',
      })
    }

    let total = 0

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    for (const item of products) {
      const product = productMap.get(Number(item.product_id))!
      if (!product) return
      total += product.amount * Number(item.quantity)
    }

    const paymentService = new PaymentService()

    let payment

    try {
      payment = await paymentService.charge({
        amount: total,
        name,
        email,
        cardNumber,
        cvv,
      })
    } catch (error) {
      if (error instanceof GatewayException) {
        throw error
      }
      throw new Exception('Payment gateway unavailable', {
        status: 503,
        code: 'E_PAYMENT_GATEWAY_ERROR',
      })
    }

    try {
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
    } catch (error) {
      throw new Exception('Transaction failed', {
        status: 500,
        code: 'E_TRANSACTION_ERROR',
      })
    }
  }
}
