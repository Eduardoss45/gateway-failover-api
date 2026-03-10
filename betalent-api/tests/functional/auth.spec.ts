import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('Auth', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
  })

  test('login com credenciais validas', async ({ client }) => {
    const email = `admin_${Date.now()}@admin.com`
    await User.create({ email, password: '123456', role: 'ADMIN' })

    const response = await client.post('/login').json({
      email,
      password: '123456',
    })

    response.assertStatus(200)
    response.assertBodyContains({ type: 'bearer' })
    const body = response.body() as { token?: string }
    if (!body.token) {
      throw new Error('Expected token to be present')
    }
  })

  test('login com credenciais invalidas retorna 401', async ({ client }) => {
    const email = `admin_${Date.now()}@admin.com`
    await User.create({ email, password: '123456', role: 'ADMIN' })

    const response = await client.post('/login').json({
      email,
      password: 'wrong12',
    })

    response.assertStatus(401)
  })

  test('validacao de email invalido retorna 422', async ({ client }) => {
    const response = await client.post('/login').json({
      email: 'not-an-email',
      password: '123456',
    })

    response.assertStatus(422)
  })

  test('validacao de senha curta retorna 422', async ({ client }) => {
    const response = await client.post('/login').json({
      email: 'admin@example.com',
      password: '123',
    })

    response.assertStatus(422)
  })
})
