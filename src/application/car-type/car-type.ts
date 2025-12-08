import { IsInt, IsNotEmpty, IsPositive, IsString, IsUrl } from 'class-validator'
import { Nullable } from 'class-validator-extended'
import { type Opaque } from 'type-fest'

import { validate } from '../../util'

export type CarTypeID = Opaque<number, 'car-type-id'>

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

export type CarTypeProperties = {
  id: CarTypeID
  name: string
  imageUrl: string | null
}

export class CarType {
  @IsInt()
  @IsPositive()
  public readonly id: CarTypeID

  @IsString()
  @IsNotEmpty()
  public readonly name: string

  @Nullable()
  @IsUrl()
  public readonly imageUrl: string | null

  public constructor(data: CarTypeProperties) {
    this.id = data.id
    this.name = data.name
    this.imageUrl = data.imageUrl

    validate(this)
  }
}
