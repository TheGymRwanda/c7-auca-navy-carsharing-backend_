import { Injectable } from '@nestjs/common'
import { Except } from 'type-fest'

import { IDatabaseConnection } from 'src/persistence/database-connection.interface'

import { AccessDeniedError } from '../access-denied.error'
import { ICarRepository } from '../car/car.repository.interface'
import { UserID } from '../user'

import { Booking, BookingID, BookingProperties } from './booking'
import { IBookingRepository } from './booking.repository.interface'
import { IBookingService } from './booking.service.interface'
import { InvalidBookingDateError } from './invalid-booking-date.error'

@Injectable()
export class BookingService implements IBookingService {
  private readonly databaseConnection: IDatabaseConnection
  private readonly bookingRepository: IBookingRepository
  private readonly carRepository: ICarRepository
  public constructor(
    databaseConnection: IDatabaseConnection,
    bookingRepository: IBookingRepository,
    carRepository: ICarRepository,
  ) {
    this.databaseConnection = databaseConnection
    this.bookingRepository = bookingRepository
    this.carRepository = carRepository
  }
  public async get(id: BookingID, currentUserId: UserID): Promise<Booking> {
    return this.databaseConnection.transactional(async tx => {
      const booking = await this.bookingRepository.get(tx, id)
      const car = await this.carRepository.get(tx, booking.carId)

      if (booking.renterId !== currentUserId && car.ownerId !== currentUserId) {
        throw new AccessDeniedError(
          'You are not allowed to view this booking',
          booking.carId,
        )
      }

      return booking
    })
  }

  public async getAll(): Promise<Booking[]> {
    return this.databaseConnection.transactional(tx =>
      this.bookingRepository.getAll(tx),
    )
  }

  public async create(
    _data: Except<BookingProperties, 'id'>,
  ): Promise<Booking> {
    if (new Date(_data.startDate) > new Date(_data.endDate)) {
      throw new InvalidBookingDateError(
        'The start date cannot be after the end date',
      )
    }

    return this.databaseConnection.transactional(tx =>
      this.bookingRepository.insert(tx, _data),
    )
  }

  public update(
    _updates: Partial<Except<BookingProperties, 'id'>>,
    bookingId: BookingID,
    currentUserId: UserID,
  ): Promise<Booking> {
    return this.databaseConnection.transactional(async _tx => {
      const booking = await this.get(bookingId, currentUserId)
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
