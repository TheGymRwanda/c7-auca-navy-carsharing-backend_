import { createHash, type Hash } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { IUserService, type User } from '../user'

import { AuthenticationError, Reason } from './authentication.error'
import { type IAuthenticationService } from './authentication.service.interface'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

@Injectable()
export class AuthenticationService implements IAuthenticationService {
  private readonly userService: IUserService
  private readonly jwtService: JwtService
  private readonly hash: Hash

  public constructor(userService: IUserService, jwtService: JwtService) {
    this.userService = userService
    this.jwtService = jwtService
    this.hash = createHash('sha512')
  }

  public async authenticate({
    username,
    password,
  }: {
    username: string
    password: string
  }): Promise<{ user: User; token: string }> {
    const user = await this.userService.findByName(username)

    // Note that this class does not throw any HTTP errors (such as 401 Unauthorized). That is because this is a service
    // which simply implements some logic. It does not (and should not!) care that the users are stored in the database
    // or that this method is called from a controller (i.e., via HTTP).
    // Imagine we added a command line interface to the application: we would still need to authenticate users, but
    // we would no longer be in the "HTTP world" - in that case it would make no sense to throw HTTP-specific errors.
    // Or put differently: a service must not make any assumptions about how its methods are called or by whom.

    if (user === null) {
      throw new AuthenticationError(Reason.USER_NOT_FOUND)
    }

    if (user.passwordHash !== this.hash.copy().update(password).digest('hex')) {
      throw new AuthenticationError(Reason.INVALID_PASSWORD)
    }

    const token = this.jwtService.sign({
      sub: user.id,
    })

    return { user, token }
  }
}
