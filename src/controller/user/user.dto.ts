import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator'
import { type Writable } from 'type-fest'

import { User, type UserID } from '../../application'
import { validate } from '../../util'

export class UserDTO {
  @ApiProperty({
    description: 'The id of the user.',
    minimum: 1,
    example: 42,
  })
  @IsInt()
  @IsPositive()
  public readonly id!: UserID

  @ApiProperty({
    description: 'The name of the user.',
    example: 'Beatrice',
  })
  @IsString()
  @IsNotEmpty()
  public readonly name!: string

  public static create(data: { id: UserID; name: string }): UserDTO {
    const instance = new UserDTO() as Writable<UserDTO>

    instance.id = data.id
    instance.name = data.name

    return validate(instance)
  }

  public static fromModel(user: User): UserDTO {
    // Note that this transformation drops the "passwordHash" field! We don't ever want that to be sent to the
    // client.
    return UserDTO.create(user)
  }
}
