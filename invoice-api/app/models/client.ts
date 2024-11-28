import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import Address from '#models/address'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Invoice from '#models/invoice'

export default class Client extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasOne(() => Address)
  declare address: HasOne<typeof Address>

  @hasMany(() => Invoice)
  declare invoice: HasMany<typeof Invoice>
}
