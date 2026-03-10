import Gateway from '#models/gateway'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Gateway.createMany([
      {
        name: 'Gateway 1',
        priority: 1,
        isActive: true,
      },
      {
        name: 'Gateway 2',
        priority: 2,
        isActive: true,
      },
    ])
  }
}
