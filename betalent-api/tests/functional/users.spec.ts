import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { loginAs } from '../helpers/auth.ts'

test.group('Users', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
  })

  test('ADMIN cria usuario', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const email = `user1_${Date.now()}@example.com`

    const response = await client.post('/users').bearerToken(token).json({
      email,
      password: '123456',
      role: 'USER',
    })

    response.assertStatus(200)
    response.assertBodyContains({ email, role: 'USER' })
  })

  test('USER nao pode criar usuario', async ({ client }) => {
    const token = await loginAs(client, 'USER')

    const response = await client.post('/users').bearerToken(token).json({
      email: 'user2@example.com',
      password: '123456',
      role: 'USER',
    })

    response.assertStatus(403)
  })

  test('ADMIN atualiza usuario', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const email = `user3_${Date.now()}@example.com`
    const user = await User.create({ email, password: '123456', role: 'USER' })

    const response = await client.put(`/users/${user.id}`).bearerToken(token).json({
      role: 'MANAGER',
    })

    response.assertStatus(200)
    response.assertBodyContains({ role: 'MANAGER' })
  })

  test('ADMIN remove usuario', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const user = await User.create({ email: 'user4@example.com', password: '123456', role: 'USER' })

    const response = await client.delete(`/users/${user.id}`).bearerToken(token)

    response.assertStatus(204)
  })

  test('validacao de payload invalido retorna 422', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')

    const response = await client.post('/users').bearerToken(token).json({
      email: 'invalid',
      password: '123',
      role: 'INVALID',
    })

    response.assertStatus(422)
  })

  test('ADMIN lista usuarios', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    await User.create({ email: `user_list_${Date.now()}@example.com`, password: '123456', role: 'USER' })

    const response = await client.get('/users').bearerToken(token)

    response.assertStatus(200)
    const body = response.body() as Array<{ password?: string }>
    if (body[0] && typeof body[0].password !== 'undefined') {
      throw new Error('Password should not be exposed')
    }
  })

  test('ADMIN detalha usuario', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const email = `user_show_${Date.now()}@example.com`
    const user = await User.create({ email, password: '123456', role: 'USER' })

    const response = await client.get(`/users/${user.id}`).bearerToken(token)

    response.assertStatus(200)
    response.assertBodyContains({ id: user.id, email })
    const body = response.body() as { password?: string }
    if (typeof body.password !== 'undefined') {
      throw new Error('Password should not be exposed')
    }
  })
})
