import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await User.updateOrCreate(
      { email: 'admin@admin.com' },
      {
        password: '123456',
        role: 'ADMIN',
      }
    )
  }
}
