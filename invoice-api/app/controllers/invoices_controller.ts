import type { HttpContext } from '@adonisjs/core/http'
import Invoice from '#models/invoice'

export default class InvoicesController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const userId = user.id

    const invoices = await Invoice.query()
      .where('user_id', userId)
      .preload('user')
      .preload('client')
      .preload('invoiceItem')

    return response.status(200).json(invoices)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const { paymentTerms, invoiceDate, description, status, clientId, userId, items } =
      request.only([
        'paymentTerms',
        'invoiceDate',
        'description',
        'status',
        'clientId',
        'userId',
        'items',
      ])
    const invoiceNumber = await this.generateInvoiceNumber(invoiceDate)
    const invoice = await Invoice.create({
      invoiceNumber,
      paymentTerms,
      invoiceDate,
      description,
      status,
      clientId,
      userId,
    })

    for (const item of items) {
      await invoice.related('invoiceItem').create(item)
    }

    await invoice.load('invoiceItem')

    return response.status(200).send(invoice)
  }

  /**
   * Show individual record
   */
  async show({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const userId = user.id
    const id = request.param('id')
    const invoice = await Invoice.findOrFail(id)

    if (invoice.userId !== userId) {
      return response.status(403).json({
        message: 'Not authorized',
      })
    }

    await invoice.load((loader) => {
      loader.load('user', (query) => {
        query.preload('address')
      })
      loader.load('client', (query) => {
        query.preload('address')
      })
      loader.load('invoiceItem')
    })

    return response.status(200).json(invoice)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const userId = user.id
    const id = request.param('id')
    const invoice = await Invoice.findOrFail(id)

    if (invoice.userId !== userId) {
      return response.status(403).json({
        message: 'You are not authorized to update this invoice',
      })
    }

    const { paymentTerms, invoiceDate, description, status, clientId, items } = request.only([
      'paymentTerms',
      'invoiceDate',
      'description',
      'status',
      'clientId',
      'items',
    ])

    invoice.merge({ paymentTerms, description, clientId, userId, invoiceDate, status })
    await invoice.save()

    if (items && items.length > 0) {
      for (const item of items) {
        await invoice.related('invoiceItem').updateOrCreate({}, item)
      }
    }

    return response.status(200).json({ message: 'Updated successfully.' })
  }

  /**
   * Delete record
   */
  async destroy({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const userId = user.id
    const id = request.param('id')
    const invoice = await Invoice.findOrFail(id)

    if (invoice.userId !== userId) {
      return response.status(403).json({
        message: 'You are not authorized to delete this invoice',
      })
    }

    await invoice.delete()

    return response.status(200).json({ message: 'Deleted successfully.' })
  }

  async generateInvoiceNumber(invoiceDate: string) {
    const getYear = invoiceDate.split('-')[0]
    const getMonth = invoiceDate.split('-')[1]
    const getDay = invoiceDate.split('-')[2].split('T')[0]
    const formatedDate = `${getYear}${getMonth}${getDay}`
    const lastInvoiceNumber = await Invoice.query().orderBy('invoice_number', 'desc').first()
    const invoiceNumber = lastInvoiceNumber
      ? Number.parseInt(lastInvoiceNumber.invoiceNumber.split('-')[2]) + 1
      : 1

    return `FR-${formatedDate}-${invoiceNumber}`
  }
}
