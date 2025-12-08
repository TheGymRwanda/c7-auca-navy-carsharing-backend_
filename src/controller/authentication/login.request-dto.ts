import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

export class LoginRequestDTO {
  @ApiProperty({
    description: 'The name of the user.',
    minLength: 1,
    writeOnly: true,
    example: 'Beatrice',
  })
  @IsString()
  @IsNotEmpty()
  public readonly username!: string

  @ApiProperty({
    description: `The user's password.`,
    format: 'password',
    minLength: 1,
    writeOnly: true,
    example: '54cr37',
  })
  @IsString()
  @IsNotEmpty()
  public readonly password!: string
}
