import Gateway from '#models/gateway'
import type { HttpContext } from '@adonisjs/core/http'
import { updateGatewayPriorityValidator, updateGatewayStatusValidator } from '#validators/gateway_validator'

export default class GatewaysController {
  async updateStatus({ request, params, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) return response.notFound({ message: 'Gateway not found' })

    const { is_active } = await request.validateUsing(updateGatewayStatusValidator)
    gateway.isActive = is_active
    await gateway.save()

    return gateway
  }

  async updatePriority({ request, params, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) return response.notFound({ message: 'Gateway not found' })

    const { priority } = await request.validateUsing(updateGatewayPriorityValidator)
    gateway.priority = priority
    await gateway.save()
    
    return gateway
  }
}
