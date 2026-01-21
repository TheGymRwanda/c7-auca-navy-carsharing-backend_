import { Injectable } from '@nestjs/common'
import { Except } from 'type-fest'

import { IDatabaseConnection } from 'src/persistence/database-connection.interface'

import { AccessDeniedError } from '../access-denied.error'
import { UserID } from '../user'

import { Booking, BookingID, BookingProperties } from './booking'
import { BookingInvalidError } from './booking-invalid-error'
import { BookingState } from './booking-state'
import { IBookingRepository } from './booking.repository.interface'
import { IBookingService } from './booking.service.interface'

@Injectable()
export class BookingService implements IBookingService {
  private readonly databaseConnection: IDatabaseConnection
  private readonly bookingRepository: IBookingRepository
  public constructor(
    databaseConnection: IDatabaseConnection,
    bookingRepository: IBookingRepository,
  ) {
    this.databaseConnection = databaseConnection
    this.bookingRepository = bookingRepository
  }
  public async get(id: BookingID): Promise<Booking> {
    return this.databaseConnection.transactional(tx =>
      this.bookingRepository.get(tx, id),
    )
  }

  public async getAll(): Promise<Booking[]> {
    return this.databaseConnection.transactional(tx =>
      this.bookingRepository.getAll(tx),
    )
  }

  public create(_data: Except<BookingProperties, 'id'>): Promise<Booking> {
    throw new Error('Not implemented')
  }

  public validateBooking(updateBookingState: BookingState, booking: Booking) {
    if (
      (updateBookingState === BookingState.ACCEPTED &&
        booking.state === BookingState.PENDING) ||
      (updateBookingState === BookingState.DECLINED &&
        booking.state === BookingState.PENDING) ||
      (updateBookingState === BookingState.PICKED_UP &&
        booking.state === BookingState.ACCEPTED) ||
      (updateBookingState === BookingState.RETURNED &&
        booking.state === BookingState.PICKED_UP)
    ) {
      return true
    }
    throw new BookingInvalidError(booking.id)
  }
  public update(
    _updates: Partial<Except<BookingProperties, 'id'>>,
    bookingId: BookingID,
    currentUserId: UserID,
  ): Promise<Booking> {
    return this.databaseConnection.transactional(async _tx => {
      const booking = await this.get(bookingId)
      if (booking.renterId !== currentUserId) {
        throw new AccessDeniedError(
          'Updates not allowed for bookings you did not create',
          booking.carId,
        )
      }
      const bookingState = _updates.state as BookingState
      this.validateBooking(bookingState, booking)
      const updateBooking = {
        ...booking,
        ..._updates,
      }
      return this.bookingRepository.update(_tx, updateBooking)
    })
  }
}
