import { IsString, MinLength } from 'class-validator'

import { validate } from '../../util'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

export class AuthenticationConfig {
  @IsString()
  @MinLength(16)
  public readonly jwtSecret: string

  public constructor(data: { jwtSecret: string }) {
    this.jwtSecret = data.jwtSecret

    validate(this)
  }
}
