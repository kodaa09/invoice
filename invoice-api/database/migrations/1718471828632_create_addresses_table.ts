import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'addresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('street').notNullable()
      table.string('city').notNullable()
      table.string('postcode').notNullable()
      table.string('country').notNullable()
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('client_id').unsigned().references('clients.id').onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['street', 'city', 'postcode', 'country'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
