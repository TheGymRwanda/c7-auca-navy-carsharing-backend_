import { type CanActivate, type ExecutionContext } from '@nestjs/common'
import { type Request } from 'express'
import { type UnknownRecord } from 'type-fest'

import { type User } from '../application'

import { AuthenticationGuard } from './authentication.guard'

export class AuthenticationGuardMock implements CanActivate {
  public user: User

  public constructor(user: User) {
    this.user = user
  }

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & UnknownRecord>()

    request[AuthenticationGuard.USER_REQUEST_PROPERTY] = this.user
    return true
  }
}
