import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { loginAs } from '../helpers/auth.ts'
import { createClient, createGateway, createProduct, createTransaction } from '../helpers/factories.ts'

test.group('Clients', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
  })

  test('listar clientes com compras', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const gateway = await createGateway({ name: 'gateway1', priority: 1, isActive: true })
    const clientModel = await createClient()
    const product = await createProduct()
    await createTransaction({
      clientId: clientModel.id,
      gatewayId: gateway.id,
      products: [{ id: product.id, quantity: 1 }],
    })

    const response = await client.get('/clients').bearerToken(token)

    response.assertStatus(200)
  })

  test('detalhar cliente com compras', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const gateway = await createGateway({ name: 'gateway1', priority: 1, isActive: true })
    const clientModel = await createClient()
    const product = await createProduct()
    await createTransaction({
      clientId: clientModel.id,
      gatewayId: gateway.id,
      products: [{ id: product.id, quantity: 1 }],
    })

    const response = await client.get(`/clients/${clientModel.id}`).bearerToken(token)

    response.assertStatus(200)
    response.assertBodyContains({ id: clientModel.id })
  })

  test('FINANCE pode listar clientes', async ({ client }) => {
    const token = await loginAs(client, 'FINANCE')
    const gateway = await createGateway({ name: 'gateway1', priority: 1, isActive: true })
    const clientModel = await createClient()
    const product = await createProduct()
    await createTransaction({
      clientId: clientModel.id,
      gatewayId: gateway.id,
      products: [{ id: product.id, quantity: 1 }],
    })

    const response = await client.get('/clients').bearerToken(token)

    response.assertStatus(200)
  })

  test('USER nao pode listar clientes', async ({ client }) => {
    const token = await loginAs(client, 'USER')

    const response = await client.get('/clients').bearerToken(token)

    response.assertStatus(403)
  })

  test('MANAGER pode listar clientes', async ({ client }) => {
    const token = await loginAs(client, 'MANAGER')
    const response = await client.get('/clients').bearerToken(token)
    response.assertStatus(200)
  })

  test('detalhar cliente inexistente retorna 404', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const response = await client.get('/clients/999999').bearerToken(token)
    response.assertStatus(404)
  })
})
