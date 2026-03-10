import Gateway1Service from './gateway1_service.ts'
import Gateway2Service from './gateway2_service.ts'
import { ChargePayload } from './gateway_interface.ts'

export default class GatewayManager {
  private gateways = [
    { id: 1, service: new Gateway1Service() },
    { id: 2, service: new Gateway2Service() },
  ]

  async charge(payload: ChargePayload) {
    for (const gateway of this.gateways) {
      const result = await gateway.service.charge(payload)

      if (result.success) {
        return {
          ...result,
          gatewayId: gateway.id,
        }
      }
    }

    throw new Error('All gateways failed')
  }
}
