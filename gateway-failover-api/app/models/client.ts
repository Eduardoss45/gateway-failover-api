import { ClientSchema } from '#database/schema'
import { column, hasMany } from '@adonisjs/lucid/orm'
import Transaction from './transaction.ts'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Client extends ClientSchema {
  @column({
    isPrimary: true,
  })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>
}
