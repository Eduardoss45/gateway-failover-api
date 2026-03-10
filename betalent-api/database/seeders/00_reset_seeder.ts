import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // Clear dependent tables first to avoid FK violations
    await db.from('transaction_products').delete()
    await db.from('transactions').delete()
    await db.from('clients').delete()
    await db.from('products').delete()
    await db.from('gateways').delete()
    await db.from('users').delete()
  }
}
