import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Gateway from '#models/gateway'
import Product from '#models/product'
import Client from '#models/client'
import db from '@adonisjs/lucid/services/db'
import { mockGatewaysSuccess, mockGateway1FailGateway2Success, mockAllGatewaysFail, restoreAxios } from '../helpers/gateway_mocks.ts'

test.group('Purchases', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
  })

  group.each.teardown(async () => {
    restoreAxios()
  })

  test('purchase calcula total e cria transacao', async ({ client }) => {
    mockGatewaysSuccess()
    await Gateway.create({ name: 'gateway1', priority: 1, isActive: true })
    await Gateway.create({ name: 'gateway2', priority: 2, isActive: true })
    const p1 = await Product.create({ name: 'P1', amount: 1000 })
    const p2 = await Product.create({ name: 'P2', amount: 500 })

    const response = await client.post('/purchase').json({
      name: 'Buyer',
      email: 'buyer@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      products: [
        { product_id: p1.id, quantity: 2 },
        { product_id: p2.id, quantity: 1 },
      ],
    })

    response.assertStatus(201)
    response.assertBodyContains({ amount: 2500, cardLastNumbers: '6063', status: 'paid' })
  })

  test('persistencia do pivot transaction_products', async ({ client }) => {
    mockGatewaysSuccess()
    await Gateway.create({ name: 'gateway1', priority: 1, isActive: true })
    await Gateway.create({ name: 'gateway2', priority: 2, isActive: true })
    const p1 = await Product.create({ name: 'P1', amount: 1000 })
    const p2 = await Product.create({ name: 'P2', amount: 500 })

    const response = await client.post('/purchase').json({
      name: 'Buyer',
      email: 'buyer@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      products: [
        { product_id: p1.id, quantity: 2 },
        { product_id: p2.id, quantity: 1 },
      ],
    })

    response.assertStatus(201)
    const body = response.body() as { id?: number }
    if (!body.id) throw new Error('Expected transaction id')

    const rows = await db
      .from('transaction_products')
      .where('transaction_id', body.id)
      .orderBy('product_id')

    if (rows.length !== 2) {
      throw new Error('Expected 2 pivot rows')
    }
  })

  test('purchase falha quando produto nao existe', async ({ client }) => {
    mockGatewaysSuccess()
    await Gateway.create({ name: 'gateway1', priority: 1, isActive: true })

    const response = await client.post('/purchase').json({
      name: 'Buyer',
      email: 'buyer@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      products: [{ product_id: 999, quantity: 1 }],
    })

    response.assertStatus(404)
  })

  test('payload invalido retorna 422', async ({ client }) => {
    mockGatewaysSuccess()

    const response = await client.post('/purchase').json({
      email: 'buyer@example.com',
    })

    response.assertStatus(422)
  })

  test('fallback: gateway1 falha e gateway2 succeed', async ({ client }) => {
    mockGateway1FailGateway2Success()
    await Gateway.query().update({ isActive: false, priority: 99 })
    await Gateway.updateOrCreate(
      { name: 'gateway1' },
      { name: 'gateway1', priority: 1, isActive: true }
    )
    const gw2 = await Gateway.updateOrCreate(
      { name: 'gateway2' },
      { name: 'gateway2', priority: 2, isActive: true }
    )
    const product = await Product.create({ name: 'P1', amount: 1000 })

    const response = await client.post('/purchase').json({
      name: 'Buyer',
      email: 'buyer@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      products: [{ product_id: product.id, quantity: 1 }],
    })

    response.assertStatus(201)
    response.assertBodyContains({ gatewayId: gw2.id })
  })

  test('prioridade define gateway utilizado', async ({ client }) => {
    mockGatewaysSuccess()
    await Gateway.query().update({ isActive: false, priority: 99 })
    const gw2 = await Gateway.updateOrCreate(
      { name: 'gateway2' },
      { name: 'gateway2', priority: 1, isActive: true }
    )
    await Gateway.updateOrCreate(
      { name: 'gateway1' },
      { name: 'gateway1', priority: 2, isActive: true }
    )
    const product = await Product.create({ name: 'P1', amount: 1000 })

    const response = await client.post('/purchase').json({
      name: 'Buyer',
      email: 'buyer2@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      products: [{ product_id: product.id, quantity: 1 }],
    })

    response.assertStatus(201)
    response.assertBodyContains({ gatewayId: gw2.id })
  })

  test('todos gateways falham retorna 502', async ({ client }) => {
    mockAllGatewaysFail()
    await Gateway.create({ name: 'gateway1', priority: 1, isActive: true })
    await Gateway.create({ name: 'gateway2', priority: 2, isActive: true })
    const product = await Product.create({ name: 'P1', amount: 1000 })

    const response = await client.post('/purchase').json({
      name: 'Buyer',
      email: 'buyer@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      products: [{ product_id: product.id, quantity: 1 }],
    })

    response.assertStatus(502)
    response.assertBodyContains({ code: 'E_GATEWAY_FAILURE' })
  })

  test('cliente reutilizado por email', async ({ client }) => {
    mockGatewaysSuccess()
    await Gateway.query().update({ isActive: false, priority: 99 })
    await Gateway.updateOrCreate(
      { name: 'gateway1' },
      { name: 'gateway1', priority: 1, isActive: true }
    )
    await Gateway.updateOrCreate(
      { name: 'gateway2' },
      { name: 'gateway2', priority: 2, isActive: true }
    )
    const product = await Product.create({ name: 'P1', amount: 1000 })

    const payload = {
      name: 'Buyer',
      email: 'buyer@example.com',
      cardNumber: '5569000000006063',
      cvv: '010',
      products: [{ product_id: product.id, quantity: 1 }],
    }

    const response1 = await client.post('/purchase').json(payload)
    response1.assertStatus(201)

    const response2 = await client.post('/purchase').json(payload)
    response2.assertStatus(201)

    const clients = await Client.query().where('email', payload.email)
    if (clients.length !== 1) throw new Error('Expected single client for same email')
  })
})
