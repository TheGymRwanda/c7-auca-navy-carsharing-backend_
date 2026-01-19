import { IsDate, IsEnum, IsInt, IsPositive } from 'class-validator'
import { type Opaque } from 'type-fest'

import { validate } from '../../util'
import { type CarID } from '../car'
import { type UserID } from '../user'

import { BookingState } from './booking-state'

export type BookingID = Opaque<number, 'booking-id'>

export type BookingProperties = {
  id: BookingID
  carId: CarID
  renterId: UserID
  startDate: Date
  endDate: Date
  state: BookingState
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

  @IsDate()
  public readonly startDate: Date

  @IsDate()
  public readonly endDate: Date

  @IsEnum(BookingState)
  public readonly state: BookingState

  public constructor(properties: BookingProperties) {
    this.id = properties.id
    this.carId = properties.carId
    this.renterId = properties.renterId
    this.startDate = properties.startDate
    this.endDate = properties.endDate
    this.state = properties.state
    validate(this)
  }
}
