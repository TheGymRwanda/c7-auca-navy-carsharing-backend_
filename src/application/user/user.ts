import {
  IsEnum,
  IsHash,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator'
import { type Opaque } from 'type-fest'

import { validate } from '../../util'
import { Role } from '../authorization/role.enum'

export type UserID = Opaque<number, 'user-id'>

export type UserProperties = {
  id: UserID
  name: string
  passwordHash: string
  role: Role
}

export class User {
  @IsInt()
  @IsPositive()
  public readonly id: UserID

  @IsString()
  @IsNotEmpty()
  public readonly name: string

  @IsHash('sha512')
  public readonly passwordHash: string

  @IsEnum(Role)
  public readonly role: Role

  public constructor(data: UserProperties) {
    this.id = data.id
    this.name = data.name
    this.passwordHash = data.passwordHash
    this.role = data.role

    validate(this)
  }
}
