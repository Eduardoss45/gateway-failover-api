import GatewayManager from './gateways/gateway_manager.ts'
import { ChargePayload } from './gateways/gateway_interface.ts'

export default class PaymentService {
  private gatewayManager = new GatewayManager()

  async charge(payload: ChargePayload) {
    return this.gatewayManager.charge(payload)
  }
}
