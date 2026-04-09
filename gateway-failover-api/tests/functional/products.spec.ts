import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Product from '#models/product'
import { loginAs } from '../helpers/auth.ts'

test.group('Products', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
  })

  test('ADMIN cria produto', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')

    const response = await client.post('/products').bearerToken(token).json({
      name: 'Produto A',
      amount: 1000,
    })

    response.assertStatus(200)
    response.assertBodyContains({ name: 'Produto A' })
  })

  test('MANAGER pode criar produto', async ({ client }) => {
    const token = await loginAs(client, 'MANAGER')

    const response = await client.post('/products').bearerToken(token).json({
      name: 'Produto B',
      amount: 2000,
    })

    response.assertStatus(200)
  })

  test('USER nao pode criar produto', async ({ client }) => {
    const token = await loginAs(client, 'USER')

    const response = await client.post('/products').bearerToken(token).json({
      name: 'Produto C',
      amount: 1500,
    })

    response.assertStatus(403)
  })

  test('listar produtos', async ({ client }) => {
    const token = await loginAs(client, 'USER')
    await Product.create({ name: 'Produto D', amount: 3000 })

    const response = await client.get('/products').bearerToken(token)

    response.assertStatus(200)
  })

  test('FINANCE pode listar produtos', async ({ client }) => {
    const token = await loginAs(client, 'FINANCE')
    await Product.create({ name: 'Produto E', amount: 4000 })

    const response = await client.get('/products').bearerToken(token)

    response.assertStatus(200)
  })

  test('validacao de payload invalido retorna 422', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')

    const response = await client.post('/products').bearerToken(token).json({
      name: 'P',
      amount: -1,
    })

    response.assertStatus(422)
  })

  test('detalhar produto', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const product = await Product.create({ name: 'Produto X', amount: 1500 })

    const response = await client.get(`/products/${product.id}`).bearerToken(token)

    response.assertStatus(200)
    response.assertBodyContains({ id: product.id, name: 'Produto X' })
  })

  test('atualizar produto', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const product = await Product.create({ name: 'Produto Y', amount: 2000 })

    const response = await client.put(`/products/${product.id}`).bearerToken(token).json({
      name: 'Produto Y+',
    })

    response.assertStatus(200)
    response.assertBodyContains({ name: 'Produto Y+' })
  })

  test('remover produto', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const product = await Product.create({ name: 'Produto Z', amount: 2500 })

    const response = await client.delete(`/products/${product.id}`).bearerToken(token)

    response.assertStatus(204)
  })
})
