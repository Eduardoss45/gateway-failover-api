import Gateway from '#models/gateway'
import Gateway1Service from './gateway1_service.ts'
import Gateway2Service from './gateway2_service.ts'
import { ChargePayload } from './gateway_interface.ts'
import GatewayException from '#exceptions/gateway_exception'

export default class GatewayManager {
  private gatewayServices: { [key: string]: Gateway1Service | Gateway2Service } = {
    gateway1: new Gateway1Service(),
    gateway2: new Gateway2Service(),
  }

  async charge(payload: ChargePayload) {
    const gateways = await Gateway.query().where('is_active', true).orderBy('priority')

    for (const gateway of gateways) {
      const service = this.resolveGateway(gateway.name)

      const result = await service.charge(payload)

      if (result.success) {
        return {
          ...result,
          gatewayId: gateway.id,
        }
      }
    }

    throw new GatewayException()
  }

  private resolveGateway(name: string) {
    const key = name.replace(/\s+/g, '').toLowerCase()
    const service = this.gatewayServices[key]
    if (!service) throw new Error(`Gateway '${name}' not found`)
    return service
  }
}
