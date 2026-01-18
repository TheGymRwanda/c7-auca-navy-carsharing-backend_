import { IsDate, IsEnum, IsInt, IsPositive } from 'class-validator'
import { Opaque } from 'type-fest'

import { validate } from 'src/util'

import { CarID, CarState } from '../car'
import { UserID } from '../user'

export type BookingID = Opaque<number, 'booking-id'>

export type BookingProperties = {
  id: BookingID
  carId: CarID
  state: CarState
  renterId: UserID
  startDate: string,
  endDate: string
}

export class Booking {
  @IsInt()
  @IsPositive()
  public readonly id: BookingID

  @IsInt()
  @IsPositive()
  public readonly carId: CarID

  @IsInt()
  @IsPositive()
  public readonly renterId: UserID

  @IsEnum(CarState)
  public readonly state: CarState

  @IsDate()
  public readonly startDate: string

  @IsDate()
  public readonly endDate: string

  public constructor(data: BookingProperties) {
    this.id = data.id
    this.carId = data.carId
    this.state = data.state
    this.renterId = data.renterId
    this.startDate = data.startDate
    this.endDate = data.endDate
    validate(this)
  }
}
