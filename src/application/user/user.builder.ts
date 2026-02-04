import { createHash } from 'node:crypto'

import { type Except } from 'type-fest'

import { Role } from '../authorization/role.enum'

import { User, type UserID, type UserProperties } from './user'

type UntaggedUserProperties = Except<UserProperties, 'id'> & {
  id: number
}

const hash = createHash('sha512')

export class UserBuilder {
  private readonly properties: UntaggedUserProperties = {
    id: 7,
    name: 'Beatrice',
    passwordHash:
      'b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86',
    role: Role.admin,
  }

  public static from(
    properties: User | Partial<UntaggedUserProperties>,
  ): UserBuilder {
    return new UserBuilder().with(properties)
  }

  public with(properties: Partial<UntaggedUserProperties>): this {
    let key: keyof UntaggedUserProperties

    for (key in properties) {
      const value = properties[key]

      if (value !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.properties[key] = value
      }
    }

    return this
  }

  public withId(id: number): this {
    this.properties.id = id
    return this
  }

  public withName(name: string): this {
    this.properties.name = name
    return this
  }

  public withPassword(password: string): this {
    this.properties.passwordHash = hash.copy().update(password).digest('hex')
    return this
  }

  public withPasswordHash(passwordHash: string): this {
    this.properties.passwordHash = passwordHash
    return this
  }

  public build(): User {
    return new User({ ...this.properties, id: this.properties.id as UserID })
  }
}
