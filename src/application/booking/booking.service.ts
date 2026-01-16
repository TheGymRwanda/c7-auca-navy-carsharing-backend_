import { Injectable } from '@nestjs/common'
import { Except } from 'type-fest'

import { IDatabaseConnection } from 'src/persistence/database-connection.interface'

import { UserID } from '../user'

import { Booking, BookingID, BookingProperties } from './booking'
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
  public get(): Promise<Booking> {
    throw new Error('Not implemented')
  }

  public async getAll(): Promise<Booking[]> {
    return this.databaseConnection.transactional(tx =>
      this.bookingRepository.getAll(tx),
    )
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
