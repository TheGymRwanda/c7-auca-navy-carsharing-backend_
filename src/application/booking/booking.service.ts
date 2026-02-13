import { Injectable } from '@nestjs/common'
import { Except } from 'type-fest'

import {
  IDatabaseConnection,
  Transaction,
} from 'src/persistence/database-connection.interface'

import { AccessDeniedError } from '../access-denied.error'
import { CarID } from '../car/car'
import { ICarRepository } from '../car/car.repository.interface'
import { UserID } from '../user'

import { Booking, BookingID, BookingProperties } from './booking'
import { BookingInvalidError } from './booking-invalid-error'
import { BookingNotFoundError } from './booking-not-found.error'
import { BookingState } from './booking-state'
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
  public async validateBookingAccess(
    tx: Transaction,
    booking: Booking,
    currentUserId: UserID,
  ): Promise<boolean> {
    const car = await this.carRepository.get(tx, booking.carId)

    if (booking.renterId !== currentUserId && car.ownerId !== currentUserId) {
      throw new AccessDeniedError(
        'You are not allowed to view this booking',
        booking.carId,
      )
    }
    return true
  }
  public async get(id: BookingID, currentUserId: UserID): Promise<Booking> {
    return this.databaseConnection.transactional(async tx => {
      const booking = await this.bookingRepository.get(tx, id)
      await this.validateBookingAccess(tx, booking, currentUserId)
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
    const { carId, startDate, endDate } = _data

    return this.databaseConnection.transactional(async tx => {
      const overlappingBooking =
        await this.bookingRepository.findOverlappingBooking(
          tx,
          carId,
          new Date(startDate),
          new Date(endDate),
        )

      if (overlappingBooking) {
        throw new InvalidBookingDateError(
          'This car is already booked for the selected time period',
        )
      }

      return this.bookingRepository.insert(tx, _data)
    })
  }

  public async findRenterBooking(
    carId: CarID,
    renterId: UserID,
  ): Promise<boolean> {
    return this.databaseConnection.transactional(async tx => {
      return await this.bookingRepository.findRenterBooking(tx, renterId, carId)
    })
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
      const booking = await this.get(bookingId, currentUserId)
      if (booking.renterId !== currentUserId) {
        throw new AccessDeniedError(
          'Updates not allowed for bookings you did not create',
          booking.carId,
        )
      }
      if (_updates.state) {
        const bookingState = _updates.state
        this.validateBooking(bookingState, booking)
        const updateBooking = {
          ...booking,
          ..._updates,
        }
        return this.bookingRepository.update(_tx, updateBooking)
      }
      throw new BookingInvalidError(bookingId)
    })
  }

  public async delete(bookingId: BookingID) {
    await this.databaseConnection.transactional(async tx => {
      const booking = await this.bookingRepository.get(tx, bookingId)
      if (!booking) throw new BookingNotFoundError(bookingId)
      if (booking.state === BookingState.PICKED_UP) {
        throw new BookingInvalidError(bookingId)
      }
      return await this.bookingRepository.delete(tx, bookingId)
    })
  }
}
