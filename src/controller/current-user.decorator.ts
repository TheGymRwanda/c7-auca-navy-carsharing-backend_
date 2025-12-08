import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common'
import type { Request as ExpressRequest } from 'express'

import { type User } from '../application'

import { AuthenticationGuard } from './authentication.guard'

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

// This is a parameter decorator (see https://docs.nestjs.com/custom-decorators#param-decorators) that can be used to
// inject the ID of the current user into a controller method.
// The "current user" is the user to whom the JWT was issued, and it is set by the AuthenticationGuard as a property of
// the current request.

export const CurrentUser = createParamDecorator<never, ExecutionContext, User>(
  (_data: never, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<ExpressRequest>()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = request[AuthenticationGuard.USER_REQUEST_PROPERTY] as
      | User
      | undefined

    if (user === undefined) {
      // If this happens, we've done something wrong and the application should crash and burn. It probably means that
      // the decorator was used in a route that is not protected by the AuthenticationGuard which would be a bug.
      throw new InternalServerErrorException(
        'Expected current user to be set in request',
      )
    }

    return user
  },
)
