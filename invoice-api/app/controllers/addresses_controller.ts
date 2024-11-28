import type { HttpContext } from '@adonisjs/core/http'
import Address from '#models/address'
import Client from '#models/client'
import User from '#models/user'

export default class AddressesController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    const addresses = await Address.query().preload('user').preload('client')

    return response.status(200).json(addresses)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const { street, city, postcode, country, clientId, userId } = request.only([
      'street',
      'city',
      'postcode',
      'country',
      'clientId',
      'userId',
    ])
    const address = await Address.create({ street, city, postcode, country })

    if (userId) {
      const user = await User.findOrFail(userId)
      await address.related('user').associate(user)
    }

    if (clientId) {
      const client = await Client.findOrFail(clientId)
      await address.related('client').associate(client)
    }

    return response.status(200).send(address)
  }

  /**
   * Show individual record
   */
  async show({ request, response }: HttpContext) {
    const id = request.param('id')
    const address = await Address.findOrFail(id)

    await address.load('user')
    await address.load('client')

    return response.status(200).json(address)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ request, response }: HttpContext) {
    const { street, city, postcode, country } = request.only([
      'street',
      'city',
      'postcode',
      'country',
    ])
    const id = request.param('id')
    await Address.query().where('id', id).update({ street, city, postcode, country })

    return response.status(200).json({ message: 'Updated successfully.' })
  }

  /**
   * Delete record
   */
  async destroy({ request, response }: HttpContext) {
    const id = request.param('id')
    const address = await Address.findOrFail(id)

    await address.delete()

    return response.status(200).json({ message: 'Deleted successfully.' })
  }
}
