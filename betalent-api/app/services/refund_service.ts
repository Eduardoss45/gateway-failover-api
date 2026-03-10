import Transaction from '#models/transaction'
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

    const gatewayId = transaction.gatewayId
    let refunded = false

    if (gatewayId === 1) {
      refunded = await new Gateway1Service().refund(transaction.externalId)
    } else if (gatewayId === 2) {
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
