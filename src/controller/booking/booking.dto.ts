import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsPositive, IsEnum } from 'class-validator'
import { Writable } from 'type-fest'

import {
  CarID,
  CarState,
  UserID,
  Booking,
  ITimeProvider,
} from 'src/application'
import { type BookingID } from 'src/application/booking/booking'
import { validate } from 'src/util'

export class BookingDTO {
  @ApiProperty({
    description: 'The booking id of a car',
    minimum: 1,
    type: 'integer',
    example: 9,
    readOnly: true,
  })
  @IsInt()
  @IsPositive()
  public readonly id!: BookingID

  @ApiProperty({
    description: 'The id of the car.',
    type: 'integer',
    minimum: 1,
    example: 13,
    readOnly: true,
  })
  @IsInt()
  @IsPositive()
  public readonly carId!: CarID

  @ApiProperty({
    description: 'The current state of the car.',
    enum: CarState,
    example: CarState.LOCKED,
  })
  @IsEnum(CarState)
  public readonly state!: CarState

  @ApiProperty({
    description: 'The id of the user who rented the car.',
    minimum: 1,
    example: 23,
  })
  @IsInt()
  @IsPositive()
  public readonly renterId!: UserID

  @ApiProperty({
    description: 'The start date of the booking',
    example: '2023-08-08T14:07:27.828Z',
  })
  public readonly startDate!: ITimeProvider

  @ApiProperty({
    description: 'The start date of the booking',
    example: '2023-08-08T14:07:27.828Z',
  })
  public readonly endDate!: ITimeProvider

  public static create(data: {
    id: BookingID
    carId: CarID
    state: CarState
    renterId: UserID
    startDate: ITimeProvider
    endDate: ITimeProvider
  }): BookingDTO {
    const instance = new BookingDTO() as Writable<BookingDTO>
    instance.id = data.id
    instance.carId = data.carId
    instance.renterId = data.renterId
    instance.state = data.state
    instance.startDate = data.startDate
    instance.endDate = data.endDate
    return validate(instance)
  }

  public static fromModel(booking: Booking) {
    return BookingDTO.create(booking)
  }
}
