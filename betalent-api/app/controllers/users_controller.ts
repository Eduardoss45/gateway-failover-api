import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { createUserValidator, updateUserValidator } from '#validators/user_validator'

export default class UsersController {
  async store({ request }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)
    return User.create(data)
  }

  async index() {
    return User.all()
  }

  async show({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })
    return user
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })

    const data = await request.validateUsing(updateUserValidator)

    user.merge(data)
    await user.save()
    return user
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })

    await user.delete()
    return response.noContent()
  }
}
