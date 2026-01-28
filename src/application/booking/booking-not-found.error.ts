import { NotFoundError } from '../not-found.error'

import { type BookingID } from './booking'

export class BookingNotFoundError extends NotFoundError<BookingID> {
  public constructor(bookingId: BookingID) {
    super('Booking not found', bookingId)
  }
}
