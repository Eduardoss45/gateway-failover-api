import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Transaction from '#models/transaction'
import { loginAs } from '../helpers/auth.ts'
import { createClient, createGateway, createProduct, createTransaction } from '../helpers/factories.ts'
import { mockRefundSuccess, restoreAxios } from '../helpers/gateway_mocks.ts'

test.group('Transactions', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
  })

  group.each.teardown(async () => {
    restoreAxios()
  })

  test('listar transactions com preload', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const gateway = await createGateway({ name: 'gateway1', priority: 1, isActive: true })
    const clientModel = await createClient()
    const product = await createProduct()
    await createTransaction({
      clientId: clientModel.id,
      gatewayId: gateway.id,
      products: [{ id: product.id, quantity: 2 }],
    })

    const response = await client.get('/transactions').bearerToken(token)

    response.assertStatus(200)
    const body = response.body() as Array<{ client?: unknown; products?: unknown; gateway?: unknown }>
    if (!body[0] || !body[0].client || !body[0].products || !body[0].gateway) {
      throw new Error('Expected preloaded relations in transactions list')
    }
  })

  test('FINANCE pode listar transactions', async ({ client }) => {
    const token = await loginAs(client, 'FINANCE')
    const response = await client.get('/transactions').bearerToken(token)
    response.assertStatus(200)
  })

  test('MANAGER pode listar transactions', async ({ client }) => {
    const token = await loginAs(client, 'MANAGER')
    const response = await client.get('/transactions').bearerToken(token)
    response.assertStatus(200)
  })

  test('USER nao pode listar transactions', async ({ client }) => {
    const token = await loginAs(client, 'USER')
    const response = await client.get('/transactions').bearerToken(token)
    response.assertStatus(403)
  })

  test('detalhar transaction', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const gateway = await createGateway({ name: 'gateway1', priority: 1, isActive: true })
    const clientModel = await createClient()
    const product = await createProduct()
    const transaction = await createTransaction({
      clientId: clientModel.id,
      gatewayId: gateway.id,
      products: [{ id: product.id, quantity: 1 }],
    })

    const response = await client.get(`/transactions/${transaction.id}`).bearerToken(token)

    response.assertStatus(200)
    response.assertBodyContains({ id: transaction.id })
    const body = response.body() as { client?: unknown; products?: unknown; gateway?: unknown }
    if (!body.client || !body.products || !body.gateway) {
      throw new Error('Expected preloaded relations in transaction detail')
    }
  })

  test('refund atualiza status para refunded', async ({ client }) => {
    mockRefundSuccess()
    const token = await loginAs(client, 'ADMIN')
    const gateway = await createGateway({ name: 'gateway1', priority: 1, isActive: true })
    const clientModel = await createClient()
    const transaction = await createTransaction({
      clientId: clientModel.id,
      gatewayId: gateway.id,
      externalId: 'ext_123',
      status: 'paid',
    })

    const response = await client.post(`/transactions/${transaction.id}/refund`).bearerToken(token)

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Refund successful' })

    const updated = await Transaction.findOrFail(transaction.id)
    if (updated.status !== 'refunded') {
      throw new Error('Expected transaction to be refunded')
    }
  })

  test('refund falha sem gateway/external_id', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const gateway = await createGateway({ name: 'gateway1', priority: 1, isActive: true })
    const clientModel = await createClient()
    const transaction = await createTransaction({
      clientId: clientModel.id,
      gatewayId: gateway.id,
      externalId: null,
      status: 'paid',
    })

    const response = await client.post(`/transactions/${transaction.id}/refund`).bearerToken(token)

    response.assertStatus(400)
  })

  test('USER nao pode fazer refund', async ({ client }) => {
    const token = await loginAs(client, 'USER')
    const response = await client.post('/transactions/1/refund').bearerToken(token)
    response.assertStatus(403)
  })

  test('refund falha sem gateway_id', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const clientModel = await createClient()
    const transaction = await createTransaction({
      clientId: clientModel.id,
      gatewayId: null,
      externalId: 'ext_123',
      status: 'paid',
    })

    const response = await client.post(`/transactions/${transaction.id}/refund`).bearerToken(token)
    response.assertStatus(400)
  })
})
