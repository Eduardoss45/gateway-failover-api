import Client from '#models/client'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const clients = [
      { name: 'Cliente Demo 1', email: 'cliente1@example.com' },
      { name: 'Cliente Demo 2', email: 'cliente2@example.com' },
    ]

    await Client.createMany(clients)
  }
}
