import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/auth_validator'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)

      const token = await User.accessTokens.create(user)

      return {
        token: token.value!.release(),
        type: 'bearer',
      }
    } catch {
      return response.unauthorized({ message: 'Invalid credentials' })
    }
  }

}
