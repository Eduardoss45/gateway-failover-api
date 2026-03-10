import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'
import PaymentService from './payment_service.ts'

export default class PurchaseService {
  async execute(payload: any) {
    const { name, email, cardNumber, cvv, products } = payload

    const productIds = products.map((p: any) => p.product_id)

    const dbProducts = await Product.query().whereIn('id', productIds)

    let total = 0

    for (const item of products) {
      const product = dbProducts.find((p) => p.id === item.product_id)

      if (!product) {
        throw new Error(`Product ${item.product_id} not found`)
      }

      total += product.amount * item.quantity
    }

    const client = await Client.firstOrCreate({ email }, { name })

    const paymentService = new PaymentService()

    const payment = await paymentService.charge({
      amount: total,
      name,
      email,
      cardNumber,
      cvv,
    })

    const transaction = await Transaction.create({
      clientId: client.id,
      gatewayId: payment.gatewayId!,
      externalId: payment.externalId,
      status: payment.success ? 'success' : 'failed',
      amount: total,
      cardLastNumbers: cardNumber.slice(-4),
    })

    // ! Não vou usar esse model por estar usando pivot, temos que resolver isso
    const pivotData: Record<number, { quantity: number }> = {}

    for (const item of products) {
      pivotData[item.product_id] = {
        quantity: item.quantity,
      }
    }

    await transaction.related('products').attach(pivotData)

    return transaction
  }
}
