import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Gateway from '#models/gateway'
import { loginAs } from '../helpers/auth.ts'

test.group('Gateways', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
  })

  test('ADMIN altera status do gateway', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const gateway = await Gateway.create({ name: 'gateway1', priority: 1, isActive: true })

    const response = await client
      .patch(`/gateways/${gateway.id}/status`)
      .bearerToken(token)
      .json({ is_active: false })

    response.assertStatus(200)
    response.assertBodyContains({ isActive: false })
  })

  test('ADMIN altera prioridade do gateway', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const gateway = await Gateway.create({ name: 'gateway1', priority: 1, isActive: true })

    const response = await client
      .patch(`/gateways/${gateway.id}/priority`)
      .bearerToken(token)
      .json({ priority: 2 })

    response.assertStatus(200)
    response.assertBodyContains({ priority: 2 })
  })

  test('USER nao pode alterar gateway', async ({ client }) => {
    const token = await loginAs(client, 'USER')
    const gateway = await Gateway.create({ name: 'gateway1', priority: 1, isActive: true })

    const response = await client
      .patch(`/gateways/${gateway.id}/status`)
      .bearerToken(token)
      .json({ is_active: false })

    response.assertStatus(403)
  })

  test('payload invalido retorna 422', async ({ client }) => {
    const token = await loginAs(client, 'ADMIN')
    const gateway = await Gateway.create({ name: 'gateway1', priority: 1, isActive: true })

    const response = await client
      .patch(`/gateways/${gateway.id}/priority`)
      .bearerToken(token)
      .json({ priority: 0 })

    response.assertStatus(422)
  })
})
