import { Injectable } from '@nestjs/common'
import { type Except } from 'type-fest'

import {
  BookingID,
  Booking,
  BookingProperties,
  CarID,
  CarState,
  UserID,
  ITimeProvider,
  BookingNotFoundError,
} from 'src/application'
import { IBookingRepository } from 'src/application/booking/booking.repository.interface'

import { type Transaction } from './database-connection.interface'

type Row = {
  id: BookingID
  car_id: CarID
  state: CarState
  renter_id: UserID
  start_date: ITimeProvider
  end_date: ITimeProvider
}

function rowToDomain(row: Row) {
  return new Booking({
    id: row.id,
    carId: row.car_id,
    state: row.state as CarState,
    renterId: row.renter_id,
    startDate: row.start_date,
    endDate: row.end_date,
  })
}

@Injectable()
export class BookingRepository extends IBookingRepository {
  public async get(_tx: Transaction, id: BookingID): Promise<Booking> {
    const row = await _tx.oneOrNone<Row>(
      'SELECT * FROM bookings WHERE id = ${id}',
      { id },
    )
    if (!row) {
      throw new BookingNotFoundError(id)
    }
    return rowToDomain(row)
  }

  public async getAll(tx: Transaction): Promise<Booking[]> {
    // throw new Error('Not implemented')
    const rows = await tx.any<Row>('SELECT * FROM bookings')
    return rows.map(row => rowToDomain(row))
  }

  public update(_tx: Transaction, booking: Booking): Promise<Booking> {
    throw new Error('Not implemented')
  }

  public insert(
    _tx: Transaction,
    booking: Except<BookingProperties, 'id'>,
  ): Promise<Booking> {
    throw new Error('Not implemented')
  }
}
