import { type ArgumentsHost, Catch, NotFoundException } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'

import { NotFoundError } from '../application/not-found.error'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *     ██╗     PROCEED WITH CAUTION                                                                                    *
 *     ██║                                                                                                             *
 *     ██║     This file uses some advanced features of Nest.js. You will not need to modify or fully understand       *
 *     ╚═╝     this file to successfully finish your project.                                                          *
 *     ██╗                                                                                                             *
 *     ╚═╝     That said, feel free to browse around and try things - you can always revert your changes!              *
 *                                                                                                                     *
 \*********************************************************************************************************************/

// When a NotFoundError is thrown anywhere in our application, such as a repository or a service, we want to map
// that to a "404 Not Found" HTTP response.
// This mapping could also easily be done in the controllers with a simple try/catch-block, but defining an exception
// filter allows us to handle this globally across all controllers and reduces boilerplate code.

@Catch(NotFoundError)
export class NotFoundExceptionFilter extends BaseExceptionFilter {
  public catch(exception: NotFoundError<never>, host: ArgumentsHost): void {
    super.catch(new NotFoundException(exception.message), host)
  }
}
