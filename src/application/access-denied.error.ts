import { CustomError } from 'ts-custom-error'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

/**
 * This is a generic error to be thrown whenever an action by a user was not possible due to insufficient permissions.
 * Note that this sounds very similar to Nest.js' "ForbiddenException", but there is a key difference: The Nest.js
 * class is an HttpException, so it will result in a "403 Forbidden" response. This class here, on the other hand,
 * is a domain exception, it knows nothing about HTTP and, when thrown, will result in an Internal Server Error by
 * Nest.js unless additional actions are taken.
 *
 * If you want an instance of this to cause a 403 response, it will need to be caught in the controller and mapped
 * explicitly, or an exception filter can be employed (https://docs.nestjs.com/exception-filters). In this project, we
 * opt for the latter, see /controllers/access-denied.exception-filter.ts
 */

export class AccessDeniedError<T extends number> extends CustomError {
  public readonly id: T

  public constructor(name: string, id: T) {
    super(`Access to ${name} with id ${id.toString()} was denied`)

    this.id = id
  }
}
