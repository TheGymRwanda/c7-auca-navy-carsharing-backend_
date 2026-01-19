import { type Except } from 'type-fest'

import { type Transaction } from '../../persistence/database-connection.interface'

import { type Booking, type BookingID, type BookingProperties } from './booking'

export abstract class IBookingRepository {
  abstract insert(
    tx: Transaction,
    data: Except<BookingProperties, 'id'>,
  ): Promise<Booking>

  abstract get(tx: Transaction, id: BookingID): Promise<Booking>

  abstract find(tx: Transaction, id: BookingID): Promise<Booking | null>
}
