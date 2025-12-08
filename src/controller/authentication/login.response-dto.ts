import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsJWT, IsPositive } from 'class-validator'
import { type Writable } from 'type-fest'

import { User } from '../../application'
import { validate } from '../../util'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

export class LoginResponseDTO {
  @ApiProperty({
    description: 'The id of the user.',
    format: 'integer',
    minimum: 1,
    example: 7,
    readOnly: true,
  })
  @IsInt()
  @IsPositive()
  public readonly userId!: number

  @ApiProperty({
    description: `The JWT with which the user can authenticate themselves.`,
    minLength: 1,
    readOnly: true,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  @IsJWT()
  public readonly token!: string

  public static create(data: { user: User; token: string }): LoginResponseDTO {
    const instance = new LoginResponseDTO() as Writable<LoginResponseDTO>

    instance.userId = data.user.id
    instance.token = data.token

    return validate(instance)
  }
}
