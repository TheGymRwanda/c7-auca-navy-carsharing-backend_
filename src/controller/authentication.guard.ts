import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { type Request } from 'express'

import { type UserID, AuthenticationConfig, IUserService } from '../application'

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

// This is a "guard" - it controls whether a request is allowed to continue (and be handled by the controller to which
// it will be routed) or if Nest.js will deny access.
// For more details, read up on guards here: https://docs.nestjs.com/guards

@Injectable()
export class AuthenticationGuard implements CanActivate {
  public static readonly USER_REQUEST_PROPERTY = Symbol('current-user')

  private readonly config: AuthenticationConfig
  private readonly userService: IUserService
  private readonly jwtService: JwtService

  public constructor(
    authenticationConfig: AuthenticationConfig,
    moduleReference: ModuleRef,
    jwtService: JwtService,
  ) {
    this.config = authenticationConfig
    this.jwtService = jwtService

    // We can't inject the UserService in the constructor due to circular dependencies: it's included in the user
    // module which also contains the UserController which in turn requires this Guard. To resolve this, we use the
    // Module reference to get the user service. For details see https://docs.nestjs.com/fundamentals/module-ref
    this.userService = moduleReference.get(IUserService, { strict: false })
  }

  // This is the function called by Nest.js whenever a route is invoked which is protected by this guard. If it returns
  // false or throws an exception, access is denied.
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromHeader(request)
    const userId = this.getUserIdFromJwt(token)
    const user = await this.userService.find(userId)

    if (user === null) {
      // This can't really happen unless the user is deleted from the database while he still has a token, which is
      // an edge case.
      throw new ForbiddenException(`No user with id '${userId}' exists`)
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    request[AuthenticationGuard.USER_REQUEST_PROPERTY] = user

    return true
  }

  // Extract the user id from the JWT or throw if it is valid (i.e., properly signed, not expired, etc.).
  private getUserIdFromJwt(token: string): UserID {
    try {
      const jwt = this.jwtService.verify<{ sub: UserID }>(token, {
        secret: this.config.jwtSecret,
      })
      return jwt.sub
    } catch (error: unknown) {
      const reason = (error as Error).message
      throw new BadRequestException(`Invalid JWT: ${reason}`)
    }
  }

  // Extract the JWT from the authorization header (or throw if it is missing or empty).
  private extractTokenFromHeader(request: Request): string {
    const header = request.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authentication header is missing or does not contain not a bearer token',
      )
    }

    const token = header.slice('Bearer '.length)

    if (token.length === 0) {
      throw new UnauthorizedException('Bearer token is empty')
    }

    return token
  }
}
