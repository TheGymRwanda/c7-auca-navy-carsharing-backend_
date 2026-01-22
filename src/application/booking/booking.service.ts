import { Injectable } from '@nestjs/common'
import { Except } from 'type-fest'

import { IDatabaseConnection } from 'src/persistence/database-connection.interface'

import { AccessDeniedError } from '../access-denied.error'
import { UserID } from '../user'

import { Booking, BookingID, BookingProperties } from './booking'
import { IBookingRepository } from './booking.repository.interface'
import { IBookingService } from './booking.service.interface'
import { InvalidBookingDateError } from './invalid-booking-date.error'

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

public async create(
  _data: Except<BookingProperties, 'id'>,
): Promise<Booking> {
  const { carId, startDate, endDate } = _data;

  // 1️⃣ Validate dates (end must be after start)
  if (new Date(startDate) > new Date(endDate)) {
    throw new InvalidBookingDateError(
      'The start date cannot be after the end date',
    );
  }

   return this.databaseConnection.transactional(async tx => {
    const overlappingBooking =
      await this.bookingRepository.findOverlappingBooking(
        tx,
        carId,
        new Date(startDate),
        new Date(endDate),
      );

    if (overlappingBooking) {
      throw new InvalidBookingDateError(
        'This car is already booked for the selected time period',
      );
    }

    
    return this.bookingRepository.insert(tx, _data);
  });
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
      const updateBooking = {
        ...booking,
        ..._updates,
      }
      return this.bookingRepository.update(_tx, updateBooking)
    })
  }
}
