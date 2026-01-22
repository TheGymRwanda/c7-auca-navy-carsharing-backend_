import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsInt, IsPositive, IsEnum, IsDate } from 'class-validator'
import { Writable } from 'type-fest'

import { CarID, UserID, Booking } from 'src/application'
import { type BookingID } from 'src/application/booking/booking'
import { BookingState } from 'src/application/booking/booking-state'
import { StrictPartialType, validate } from 'src/util'
import { Type } from 'class-transformer'

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
  })
  @IsInt()
  @IsPositive()
  public readonly carId!: CarID

  @ApiProperty({
    description: 'The current state of the car.',
    enum: BookingState,
    example: BookingState.PENDING,
  })
  @IsEnum(BookingState)
  public readonly state!: BookingState

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
  @Type(() => Date)
  @IsDate()
  public readonly startDate!: string

  @ApiProperty({
    description: 'The end date of the booking',
    example: '2023-08-08T14:07:27.828Z',
  })
  @Type(() => Date)
  @IsDate()
  public readonly endDate!: string

  public static create(data: Booking): BookingDTO {
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

export class CreateBookingDTO extends PickType(BookingDTO, [
  'carId',
  'startDate',
  'endDate',
] as const) {}

export class PatchBookingDTO extends StrictPartialType(
  PickType(BookingDTO, ['state'] as const),
) {}
