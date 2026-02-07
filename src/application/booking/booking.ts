import { IsDate, IsEnum, IsInt, IsPositive } from 'class-validator'
import { Tagged } from 'type-fest'

import { validate } from 'src/util'

import { CarID } from '../car/car'
import { UserID } from '../user'

import { BookingState } from './booking-state'

export type BookingID = Tagged<number, 'booking-id'>

export type BookingProperties = {
  id: BookingID
  carId: CarID
  state: BookingState
  renterId: UserID
  startDate: Date
  endDate: Date
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

  @IsEnum(BookingState)
  public readonly state: BookingState

  @IsDate()
  public readonly startDate: Date

  @IsDate()
  public readonly endDate: Date

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
