import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import type { Request as ExpressRequest } from 'express'
import { Observable } from 'rxjs'

import { User } from 'src/application'
import { Role } from 'src/application/authorization/role.enum'

import { AuthenticationGuard } from './authentication.guard'

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<ExpressRequest>()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = request[AuthenticationGuard.USER_REQUEST_PROPERTY] as User
    if (user.role === Role.admin) {
      return true
    }
    return false
  }
}
