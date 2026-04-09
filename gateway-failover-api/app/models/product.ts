import { ProductSchema } from '#database/schema'
import { column, manyToMany } from '@adonisjs/lucid/orm'
import Transaction from './transaction.ts'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Product extends ProductSchema {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare amount: number

  @manyToMany(() => Transaction, {
    pivotTable: 'transaction_products',
    pivotColumns: ['quantity'],
  })
  declare transactions: ManyToMany<typeof Transaction>
}
