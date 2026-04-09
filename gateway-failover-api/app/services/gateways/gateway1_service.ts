import axios from 'axios'
import { GatewayInterface, ChargePayload, GatewayResponse } from './gateway_interface.ts'
import env from '#start/env'

export default class Gateway1Service implements GatewayInterface {
  private baseUrl = env.get('GW1_BASE_URL')
  private token: string | null = null

  private async authenticate() {
    if (this.token) return

    const response = await axios.post(`${this.baseUrl}/login`, {
      email: env.get('GW1_EMAIL'),
      token: env.get('GW1_TOKEN'),
    })

    this.token = response.data.token
  }

  async charge(payload: ChargePayload): Promise<GatewayResponse> {
    try {
      if (payload.cvv === '100' || payload.cvv === '200') {
        return { success: false, error: 'Gateway1 invalid card' }
      }
      await this.authenticate()

      const response = await axios.post(`${this.baseUrl}/transactions`, payload, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      return {
        success: true,
        externalId: response.data.id,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Gateway1 failed',
      }
    }
  }

  async refund(transactionId: string): Promise<boolean> {
    try {
      await axios.post(`${this.baseUrl}/transactions/${transactionId}/charge_back`)
      return true
    } catch {
      return false
    }
  }
}
