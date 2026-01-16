import { IsDate, IsEnum, IsInt, IsPositive } from 'class-validator'
import { Opaque } from 'type-fest'

import { validate } from 'src/util'

import { CarID, CarState } from '../car'
import { ITimeProvider } from '../time-provider.interface'
import { UserID } from '../user'

export type BookingID = Opaque<number, 'booking-id'>

export type BookingProperties = {
  id: BookingID
  carId: CarID
  state: CarState
  renterId: UserID
  startDate: ITimeProvider
  endDate: ITimeProvider
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
  public readonly startDate: ITimeProvider

  @IsDate()
  public readonly endDate: ITimeProvider

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
