import Gateway from '#models/gateway'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Gateway.updateOrCreate(
      { name: 'gateway1' },
      {
        priority: 1,
        isActive: true,
      }
    )

    await Gateway.updateOrCreate(
      { name: 'gateway2' },
      {
        priority: 2,
        isActive: true,
      }
    )
  }
}
