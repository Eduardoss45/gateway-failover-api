import axios from 'axios'
import { GatewayInterface, ChargePayload, GatewayResponse } from './gateway_interface.ts'
import env from '#start/env'

export default class Gateway2Service implements GatewayInterface {
  private baseUrl = env.get('GW2_BASE_URL')

  async charge(payload: ChargePayload): Promise<GatewayResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transacoes`,
        {
          valor: payload.amount,
          nome: payload.name,
          email: payload.email,
          numeroCartao: payload.cardNumber,
          cvv: payload.cvv,
        },
        {
          headers: {
            'Gateway-Auth-Token': 'tk_f2198cc671b5289fa856',
            'Gateway-Auth-Secret': '3d15e8ed6131446ea7e3456728b1211f',
          },
        }
      )

      return {
        success: true,
        externalId: response.data.id,
      }
    } catch {
      return {
        success: false,
        error: 'Gateway2 failed',
      }
    }
  }

  async refund(transactionId: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/transacoes/reembolso`,
        {
          id: transactionId,
        },
        {
          headers: {
            'Gateway-Auth-Token': 'tk_f2198cc671b5289fa856',
            'Gateway-Auth-Secret': '3d15e8ed6131446ea7e3456728b1211f',
          },
        }
      )

      return true
    } catch {
      return false
    }
  }
}
