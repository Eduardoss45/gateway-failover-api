import axios from 'axios'
import { GatewayInterface, ChargePayload, GatewayResponse } from './gateway_interface.ts'
import env from '#start/env'

export default class Gateway2Service implements GatewayInterface {
  private baseUrl = env.get('GW2_BASE_URL')
  private token = env.get('GW2_TOKEN')
  private secret = env.get('GW2_SECRET')

  async charge(payload: ChargePayload): Promise<GatewayResponse> {
    try {
      if (payload.cvv === '200' || payload.cvv === '300') {
        return { success: false, error: 'Gateway2 invalid card' }
      }
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
            'Gateway-Auth-Token': this.token,
            'Gateway-Auth-Secret': this.secret,
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
            'Gateway-Auth-Token': this.token,
            'Gateway-Auth-Secret': this.secret,
          },
        }
      )

      return true
    } catch {
      return false
    }
  }
}
