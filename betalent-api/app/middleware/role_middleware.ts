import type { HttpContext } from '@adonisjs/core/http'
import { Roles } from '../constants/roles.ts'

export default class RoleMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>, allowedRoles: string[]) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({ message: 'User not authenticated' })
    }

    if (!allowedRoles.includes(user.role)) {
      return ctx.response.forbidden({ message: 'Insufficient permissions' })
    }

    await next()
  }
}
