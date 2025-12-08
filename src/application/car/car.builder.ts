import { type Except } from 'type-fest'

import { type CarType, type CarTypeID } from '../car-type'
import { User, type UserID } from '../user'

import { Car, type CarID, type CarProperties } from './car'
import { CarState } from './car-state'
import { FuelType } from './fuel-type'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

type UntaggedCarProperties = Except<
  CarProperties,
  'id' | 'carTypeId' | 'ownerId'
> & { id: number; carTypeId: number; ownerId: number }

export class CarBuilder {
  private readonly properties: UntaggedCarProperties = {
    id: 42 as CarID,
    carTypeId: 13 as CarTypeID,
    state: CarState.LOCKED,
    name: 'My Car',
    ownerId: 7 as UserID,
    fuelType: FuelType.PETROL,
    horsepower: 100,
    licensePlate: null,
    info: null,
  }

  public static from(
    properties: Car | Partial<UntaggedCarProperties>,
  ): CarBuilder {
    return new CarBuilder().with(properties)
  }

  public with(properties: Partial<UntaggedCarProperties>): this {
    let key: keyof UntaggedCarProperties

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

  public withCarType(data: number | CarType): this {
    this.properties.carTypeId = typeof data === 'number' ? data : data.id
    return this
  }

  public withOwner(data: number | User): this {
    this.properties.ownerId = typeof data === 'number' ? data : data.id
    return this
  }

  public withState(state: CarState): this {
    this.properties.state = state
    return this
  }

  public withName(name: string): this {
    this.properties.name = name
    return this
  }

  public withFuelType(fuelType: FuelType): this {
    this.properties.fuelType = fuelType
    return this
  }

  public withHorsepower(horsepower: number): this {
    this.properties.horsepower = horsepower
    return this
  }

  public withLicensePlate(licensePlate: string | null): this {
    this.properties.licensePlate = licensePlate
    return this
  }

  public withInfo(info: string | null): this {
    this.properties.info = info
    return this
  }

  public build(): Car {
    return new Car({
      ...this.properties,
      id: this.properties.id as CarID,
      carTypeId: this.properties.carTypeId as CarTypeID,
      ownerId: this.properties.ownerId as UserID,
    })
  }
}
