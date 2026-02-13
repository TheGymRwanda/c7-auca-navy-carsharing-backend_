import { Injectable, NotImplementedException } from '@nestjs/common'
import { type Except } from 'type-fest'

import {
  BookingID,
  Booking,
  BookingProperties,
  CarID,
  UserID,
  BookingNotFoundError,
  AccessDeniedError,
} from 'src/application'
import { BookingState } from 'src/application/booking/booking-state'
import { IBookingRepository } from 'src/application/booking/booking.repository.interface'

import { type Transaction } from './database-connection.interface'

type Row = {
  id: BookingID
  car_id: CarID
  state: BookingState
  renter_id: UserID
  start_date: Date
  end_date: Date
}

function rowToDomain(row: Row) {
  return new Booking({
    id: row.id,
    carId: row.car_id,
    state: row.state as BookingState,
    renterId: row.renter_id,
    startDate: new Date(row.start_date),
    endDate: row.end_date,
  })
}

@Injectable()
export class BookingRepository extends IBookingRepository {
  public async find(_tx: Transaction, id: BookingID): Promise<Booking> {
    const row = await _tx.oneOrNone<Row>(
      'SELECT * FROM bookings WHERE id = ${id}',
      { id },
    )
    if (!row) {
      throw new BookingNotFoundError(id)
    }
    return rowToDomain(row)
  }

  public findOverlappingBooking(_tx: Transaction): Promise<Booking | null> {
    throw new NotImplementedException()
  }

  public async findRenterBooking(
    _tx: Transaction,
    renterId: UserID,
    carId: CarID,
  ): Promise<boolean> {
    const row = await _tx.manyOrNone<Row>(
      `SELECT * FROM bookings WHERE renter_id = $(renterId) AND car_id = $(carId)`,
      { renterId, carId },
    )
    if (row === null || row.length === 0) {
      throw new AccessDeniedError('User is not a renter', renterId)
    }
    return true
  }

  public async get(_tx: Transaction, id: BookingID): Promise<Booking> {
    const booking = await this.find(_tx, id)
    if (!booking) throw new BookingNotFoundError(id)
    return booking
  }

  public async getAll(tx: Transaction): Promise<Booking[]> {
    const rows = await tx.any<Row>('SELECT * FROM bookings')
    return rows.map(row => rowToDomain(row))
  }

  public async update(_tx: Transaction, booking: Booking): Promise<Booking> {
    const row = await _tx.oneOrNone<Row>(
      `UPDATE bookings SET
        state = $(state)
      WHERE id = $(id)
      RETURNING *
      `,
      { ...booking },
    )

    if (row === null) {
      throw new BookingNotFoundError(booking.id)
    }

    return rowToDomain(row)
  }

  public async insert(
    _tx: Transaction,
    booking: Except<BookingProperties, 'id'>,
  ): Promise<Booking> {
    const row = await _tx.one<Row>(
      `INSERT INTO bookings (car_id, state, renter_id, start_date, end_date)
       VALUES ($(carId), $(state), $(renterId), $(startDate), $(endDate))
       RETURNING *`,
      {
        ...booking,
      },
    )
    return rowToDomain(row)
  }

  public async delete(_tx: Transaction, bookingId: BookingID): Promise<void> {
    return await _tx.query(`DELETE FROM bookings WHERE id = $(bookingId)`, {
      bookingId,
    })
  }
}
