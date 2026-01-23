import { Except } from 'type-fest'

import { type Transaction } from '../../persistence/database-connection.interface'
import { CarID } from '../car/car'
import { UserID } from '../user'

import { Booking, BookingID, BookingProperties } from './booking'

export abstract class IBookingRepository {
  public abstract get(_tx: Transaction, id: BookingID): Promise<Booking>

  public abstract getAll(_tx: Transaction): Promise<Booking[]>

  public abstract insert(
    _tx: Transaction,
    booking: Except<BookingProperties, 'id'>,
  ): Promise<Booking>

  public abstract findRenterBooking(
    _tx: Transaction,
    renterId: UserID,
    carId: CarID,
  ): Promise<boolean>

  public abstract update(_tx: Transaction, booking: Booking): Promise<Booking>
}
