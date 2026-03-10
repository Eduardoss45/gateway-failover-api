import Gateway from '#models/gateway'
import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'

export async function createGateway(data?: Partial<Gateway>) {
  return Gateway.create({
    name: data?.name ?? `gateway${Date.now()}`,
    isActive: data?.isActive ?? true,
    priority: data?.priority ?? 1,
  })
}

export async function createProduct(data?: Partial<Product>) {
  return Product.create({
    name: data?.name ?? `Product ${Date.now()}`,
    amount: data?.amount ?? 1000,
  })
}

export async function createClient(data?: Partial<Client>) {
  return Client.create({
    name: data?.name ?? `Client ${Date.now()}`,
    email: data?.email ?? `client_${Date.now()}@example.com`,
  })
}

export async function createTransaction(params: {
  clientId: number
  gatewayId: number | null
  externalId?: string | null
  status?: string
  amount?: number
  cardLastNumbers?: string
  products?: { id: number; quantity: number }[]
}) {
  const transaction = await Transaction.create({
    clientId: params.clientId,
    gatewayId: params.gatewayId,
    externalId: params.externalId ?? 'ext_1',
    status: params.status ?? 'paid',
    amount: params.amount ?? 1000,
    cardLastNumbers: params.cardLastNumbers ?? '1234',
  })

  if (params.products?.length) {
    const pivotData: Record<number, { quantity: number }> = {}
    for (const item of params.products) {
      pivotData[item.id] = { quantity: item.quantity }
    }
    await transaction.related('products').attach(pivotData)
  }

  return transaction
}
