import { CustomError } from 'ts-custom-error'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

/**
 * This is a generic base class for "not found" errors, be that a user that wasn't found, a car, or whatever else.
 * Note that this sounds very similar to Nest.js' "NotFoundException", but there is a key difference: The Nest.js
 * class is an HttpException, so it will result in a "404 Not Found" response. This class here, on the other hand,
 * is a domain exception, it knows nothing about HTTP and, when thrown, will result in an Internal Server Error by
 * Nest.js unless additional actions are taken.
 *
 * If you want an instance of this to cause a 404 response, it will need to be caught in the controller and mapped
 * explicitly, or an exception filter can be employed (https://docs.nestjs.com/exception-filters). In this project, we
 * opt for the latter, see /controllers/not-found.exception-filter.ts
 */

export abstract class NotFoundError<T extends number> extends CustomError {
  public readonly id: T

  protected constructor(message: string, id: T) {
    super(message)

    this.id = id
  }
}
