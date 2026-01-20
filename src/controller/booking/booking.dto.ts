import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsDate, IsInt, IsPositive } from 'class-validator'
import { type Writable } from 'type-fest'
import { Type } from 'class-transformer'

import {
  type Booking,
  type BookingID,
  BookingState,
  type CarID,
  type UserID,
} from '../../application'

export class BookingDTO {
  @ApiProperty({
    description: 'The id of the booking.',
    type: 'integer',
    minimum: 1,
    example: 5,
    readOnly: true,
  })
  @IsInt()
  @IsPositive()
  public readonly id!: BookingID

  @ApiProperty({
    description: 'The id of the car being booked.',
    type: 'integer',
    minimum: 1,
    example: 1,
  })
  @IsInt()
  @IsPositive()
  public readonly carId!: CarID

  @ApiProperty({
    description: 'The id of the user renting the car.',
    type: 'integer',
    minimum: 1,
    example: 2,
  })
  @IsInt()
  @IsPositive()
  public readonly renterId!: UserID

  @ApiProperty({
    description: 'The start date of the booking.',
    type: 'string',
    format: 'date-time',
    example: '2024-01-20T10:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  public readonly startDate!: Date

  @ApiProperty({
    description: 'The end date of the booking.',
    type: 'string',
    format: 'date-time',
    example: '2024-01-25T10:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  public readonly endDate!: Date

  @ApiProperty({
    description: 'The current state of the booking.',
    enum: BookingState,
    example: BookingState.PENDING,
    readOnly: true,
  })
  public readonly state!: BookingState

  public static create(data: {
    id: BookingID
    carId: CarID
    renterId: UserID
    startDate: Date
    endDate: Date
    state: BookingState
  }): BookingDTO {
    const instance = new BookingDTO() as Writable<BookingDTO>

    instance.id = data.id
    instance.carId = data.carId
    instance.renterId = data.renterId
    instance.startDate = data.startDate
    instance.endDate = data.endDate
    instance.state = data.state

    return instance
  }

  public static fromModel(booking: Booking): BookingDTO {
    return BookingDTO.create(booking)
  }
}

export class CreateBookingDTO extends PickType(BookingDTO, [
  'carId',
  'startDate',
  'endDate',
] as const) {}
