import axios from 'axios'
import { GatewayInterface, ChargePayload, GatewayResponse } from './gateway_interface.ts'

export default class Gateway1Service implements GatewayInterface {
  private baseUrl = 'http://localhost:3001'
  private token: string | null = null

  private async authenticate() {
    if (this.token) return

    const response = await axios.post(`${this.baseUrl}/login`, {
      email: 'dev@betalent.tech',
    })

    this.token = response.data.token
  }

  async charge(payload: ChargePayload): Promise<GatewayResponse> {
    try {
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
