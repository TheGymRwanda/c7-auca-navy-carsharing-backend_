import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator'
import { Nullable } from 'class-validator-extended'
import { type Opaque } from 'type-fest'

import { validate } from '../../util'
import { type CarTypeID } from '../car-type'
import { type UserID } from '../user'

import { CarState } from './car-state'
import { FuelType } from './fuel-type'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

export type CarID = Opaque<number, 'car-id'>

export type CarProperties = {
  id: CarID
  carTypeId: CarTypeID
  name: string
  ownerId: UserID
  state: CarState
  fuelType: FuelType
  horsepower: number
  licensePlate: string | null
  info: string | null
}

export class Car {
  @IsInt()
  @IsPositive()
  public readonly id: CarID

  @IsInt()
  @IsPositive()
  public readonly carTypeId: CarTypeID

  @IsString()
  @IsNotEmpty()
  public readonly name: string

  @IsInt()
  @IsPositive()
  public readonly ownerId: UserID

  @IsEnum(FuelType)
  public readonly fuelType: FuelType

  @IsInt()
  @IsPositive()
  public readonly horsepower: number

  @Nullable()
  @IsString()
  @IsNotEmpty()
  public readonly licensePlate: string | null

  @IsEnum(CarState)
  public readonly state: CarState

  @Nullable()
  @IsString()
  public readonly info: string | null

  public constructor(data: CarProperties) {
    this.id = data.id
    this.carTypeId = data.carTypeId
    this.name = data.name
    this.ownerId = data.ownerId
    this.fuelType = data.fuelType
    this.state = data.state
    this.horsepower = data.horsepower
    this.licensePlate = data.licensePlate
    this.info = data.info

    validate(this)
  }
}
