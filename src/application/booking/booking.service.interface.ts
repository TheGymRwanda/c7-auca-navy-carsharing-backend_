import { type Except } from 'type-fest'

import { CarID } from '../car/car'
import { UserID } from '../user'

import { Booking, BookingID, BookingProperties } from './booking'

export abstract class IBookingService {
  public abstract get(id: BookingID, currentUserId: UserID): Promise<Booking>

  public abstract getAll(): Promise<Booking[]>

  public abstract create(
    _data: Except<BookingProperties, 'id'>,
  ): Promise<Booking>

  public abstract findRenterBooking(
    carId: CarID,
    renterId: UserID,
  ): Promise<boolean>

  public abstract update(
    _updates: Partial<Except<BookingProperties, 'id'>>,
    bookingId: BookingID,
    currentUserId: UserID,
  ): Promise<Booking>
}
