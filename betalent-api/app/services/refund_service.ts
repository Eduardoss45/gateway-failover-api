import Transaction from '#models/transaction'
import Gateway from '#models/gateway'
import Gateway1Service from './gateways/gateway1_service.ts'
import Gateway2Service from './gateways/gateway2_service.ts'

export default class RefundService {
  async execute(transactionId: number) {
    const transaction = await Transaction.find(transactionId)

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    if (!transaction.externalId || !transaction.gatewayId) {
      throw new Error('Transaction missing gateway data')
    }

    const gateway = await Gateway.find(transaction.gatewayId)
    if (!gateway) {
      throw new Error('Gateway not found')
    }

    const gatewayKey = gateway.name.replace(/\s+/g, '').toLowerCase()
    let refunded = false

    if (gatewayKey === 'gateway1') {
      refunded = await new Gateway1Service().refund(transaction.externalId)
    } else if (gatewayKey === 'gateway2') {
      refunded = await new Gateway2Service().refund(transaction.externalId)
    } else {
      throw new Error('Unsupported gateway')
    }

    if (!refunded) {
      throw new Error('Refund failed')
    }

    transaction.status = 'refunded'
    await transaction.save()

    return transaction
  }
}
