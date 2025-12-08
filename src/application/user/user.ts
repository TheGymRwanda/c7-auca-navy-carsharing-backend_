import {
  IsHash,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator'
import { type Opaque } from 'type-fest'

import { validate } from '../../util'

export type UserID = Opaque<number, 'user-id'>

export type UserProperties = { id: UserID; name: string; passwordHash: string }

export class User {
  @IsInt()
  @IsPositive()
  public readonly id: UserID

  @IsString()
  @IsNotEmpty()
  public readonly name: string

  @IsHash('sha512')
  public readonly passwordHash: string

  public constructor(data: UserProperties) {
    this.id = data.id
    this.name = data.name
    this.passwordHash = data.passwordHash

    validate(this)
  }
}
