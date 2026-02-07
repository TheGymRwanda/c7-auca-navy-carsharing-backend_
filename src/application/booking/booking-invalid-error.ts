import { HttpException } from '@nestjs/common'

import { type BookingID } from './booking'

export class BookingInvalidError extends HttpException {
  public constructor(bookingId: BookingID) {
    super(
      'Booking state is invalid or contains unexpected data, please try again.',
      bookingId,
    )
  }
}
