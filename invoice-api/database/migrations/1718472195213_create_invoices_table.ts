import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invoices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('payment_terms').notNullable()
      table.string('description').notNullable()
      table.string('status').notNullable()
      table.string('invoice_number').notNullable()
      table.timestamp('invoice_date').notNullable()

      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('client_id').unsigned().references('clients.id').onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
