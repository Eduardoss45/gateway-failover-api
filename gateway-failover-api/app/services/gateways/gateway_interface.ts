export interface ChargePayload {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export interface GatewayResponse {
  success: boolean
  externalId?: string
  gatewayId?: number
  error?: string
}

export interface GatewayInterface {
  charge(payload: ChargePayload): Promise<GatewayResponse>
  refund(transactionId: string): Promise<boolean>
}
