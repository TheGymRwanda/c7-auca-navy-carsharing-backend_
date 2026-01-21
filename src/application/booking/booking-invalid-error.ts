import { HttpException } from '@nestjs/common'

import { type BookingID } from './booking'

export class BookingInvalidError extends HttpException {
  public constructor(bookingId: BookingID) {
    super('Invalid booking update error', bookingId)
  }
}
