import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'

export default class ClientsController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    const clients = await Client.query().preload('address').preload('invoice')

    return response.status(200).json(clients)
  }

  /**
   * Handle form submission for the creation action
   */
  async store({ request, response }: HttpContext) {
    const { fullName, email, address } = request.only(['fullName', 'email', 'address'])
    const client = await Client.create({ fullName, email })

    await client.related('address').create(address)

    return response.status(200).send(client)
  }

  /**
   * Show individual record
   */
  async show({ response, request }: HttpContext) {
    const id = request.param('id')
    const client = await Client.findOrFail(id)

    await client.load('address')
    await client.load('invoice')

    return response.status(200).json(client)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ request, response }: HttpContext) {
    const id = request.param('id')
    const client = await Client.findOrFail(id)
    const { fullName, email, address } = request.only(['fullName', 'email', 'address'])

    client.merge({ fullName, email })
    await client.save()

    if (address) {
      await client.related('address').updateOrCreate({}, address)
    }

    return response.status(200).json({ message: 'Updated successfully.' })
  }

  /**
   * Delete record
   */
  async destroy({ request, response }: HttpContext) {
    const id = request.param('id')
    const client = await Client.findOrFail(id)

    await client.delete()

    return response.status(200).json({ message: 'Deleted successfully.' })
  }
}
