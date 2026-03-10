import Client from '#models/client'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientsController {
  async index() {
    return Client.query().preload('transactions', (t) => {
      t.preload('products')
    })
  }

  async show({ params, response }: HttpContext) {
    const client = await Client.query()
      .where('id', params.id)
      .preload('transactions', (t) => t.preload('products'))
      .first()

    if (!client) return response.notFound({ message: 'Client not found' })
    return client
  }
}
