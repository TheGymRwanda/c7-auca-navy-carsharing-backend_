import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator'

import { Role } from '../../application/authorization/role.enum'

export class CreateUserDTO {
  @ApiProperty({
    description: 'The name of the user.',
    example: 'Beatrice',
  })
  @IsString()
  @IsNotEmpty()
  public readonly name!: string

  @ApiProperty({
    description: 'The password of the user.',
    example: 'secret-password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  public readonly password!: string

  @ApiProperty({
    description: 'The role of the user.',
    enum: Role,
    example: Role.user,
  })
  @IsEnum(Role)
  public readonly role!: Role
}
