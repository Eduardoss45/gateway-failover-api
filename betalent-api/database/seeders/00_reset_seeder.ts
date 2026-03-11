import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // Reset data + auto-increment to keep seed IDs stable
    await db.rawQuery('SET FOREIGN_KEY_CHECKS = 0')
    await db.rawQuery('TRUNCATE TABLE transaction_products')
    await db.rawQuery('TRUNCATE TABLE transactions')
    await db.rawQuery('TRUNCATE TABLE clients')
    await db.rawQuery('TRUNCATE TABLE products')
    await db.rawQuery('TRUNCATE TABLE gateways')
    await db.rawQuery('TRUNCATE TABLE users')
    await db.rawQuery('TRUNCATE TABLE auth_access_tokens')
    await db.rawQuery('SET FOREIGN_KEY_CHECKS = 1')
  }
}
