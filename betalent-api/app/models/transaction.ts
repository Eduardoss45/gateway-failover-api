import { TransactionSchema } from '#database/schema'
import { belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import Client from './client.ts'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Gateway from './gateway.ts'
import Product from './product.ts'

export default class Transaction extends TransactionSchema {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clientId: number

  @column()
  declare gatewayId: number

  @column()
  declare externalId: string

  @column()
  declare status: string

  @column()
  declare amount: number

  @column()
  declare cardLastNumbers: string

  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>

  @belongsTo(() => Gateway)
  declare gateway: BelongsTo<typeof Gateway>

  @manyToMany(() => Product, {
    pivotTable: 'transaction_products',
    pivotColumns: ['quantity'],
  })
  declare products: ManyToMany<typeof Product>
}
