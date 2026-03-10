import Product from '#models/product'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const products = [
      { name: 'Plano Basico', amount: 1000 },
      { name: 'Plano Pro', amount: 2500 },
    ]

    await Product.createMany(products)
  }
}
