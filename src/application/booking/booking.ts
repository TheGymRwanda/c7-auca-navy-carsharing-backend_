import { IsDate, IsEnum, IsInt, IsPositive } from 'class-validator'
import { Opaque } from 'type-fest'

import { validate } from 'src/util'

import { CarID } from '../car'
import { UserID } from '../user'

import { BookingState } from './booking-state'

export type BookingID = Opaque<number, 'booking-id'>

export type BookingProperties = {
  id: BookingID
  carId: CarID
  state: BookingState
  renterId: UserID
  startDate: string
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

  @IsEnum(BookingState)
  public readonly state: BookingState

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
