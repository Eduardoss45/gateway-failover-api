import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/gateway'
import Client from '#models/client'
import Product from '#models/product'
import Transaction from '#models/transaction'

export default class extends BaseSeeder {
  async run() {
    const gateway1 = await Gateway.findBy('name', 'gateway1')
    const client1 = await Client.findBy('email', 'cliente1@example.com')
    const product = await Product.findBy('name', 'Plano Basico')

    if (!gateway1 || !client1 || !product) return

    const transaction = await Transaction.create({
      clientId: client1.id,
      gatewayId: gateway1.id,
      externalId: 'seed_tx_1',
      status: 'paid',
      amount: product.amount,
      cardLastNumbers: '6063',
    })

    await transaction.related('products').attach({
      [product.id]: { quantity: 1 },
    })
  }
}
