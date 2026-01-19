import { type Except } from 'type-fest'

import { type Booking, type BookingID, type BookingProperties } from './booking'

export abstract class IBookingService {
  abstract create(
    data: Except<BookingProperties, 'id' | 'state'>,
  ): Promise<Booking>

  abstract get(id: BookingID): Promise<Booking>
}
