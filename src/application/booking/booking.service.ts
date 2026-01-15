import { Except } from 'type-fest'

import { UserID } from '../user'

import { Booking, BookingID, BookingProperties } from './booking'
import { IBookingService } from './booking.service.interface'

export class BookingService extends IBookingService {
  public get(): Promise<Booking> {
    throw new Error('Not implemented')
  }

  public getAll(): Promise<Booking[]> {
    throw new Error('Not implemented')
  }

  public create(_data: Except<BookingProperties, 'id'>): Promise<Booking> {
    throw new Error('Not implemented')
  }

  public update(
    _updates: Except<BookingProperties, 'id'>,
    bookingId: BookingID,
    currentUserId: UserID,
  ): Promise<Booking> {
    throw new Error('Not implemented')
  }
}
