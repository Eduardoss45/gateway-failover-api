import { Exception } from '@adonisjs/core/exceptions'

export default class GatewayException extends Exception {
  constructor(message = 'All gateways failed') {
    super(message, {
      status: 502,
      code: 'E_GATEWAY_FAILURE',
    })
  }
}
