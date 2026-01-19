import { Injectable } from '@nestjs/common'
import { type Except } from 'type-fest'

import {
  Booking,
  BookingNotFoundError,
  type BookingID,
  type BookingProperties,
  IBookingRepository,
  type CarID,
  type UserID,
  BookingState,
} from '../application'

import { type Transaction } from './database-connection.interface'

type Row = {
  id: number
  car_id: number
  renter_id: number
  start_date: Date
  end_date: Date
  state: string
}

function rowToDomain(row: Row): Booking {
  return new Booking({
    id: row.id as BookingID,
    carId: row.car_id as CarID,
    renterId: row.renter_id as UserID,
    startDate: row.start_date,
    endDate: row.end_date,
    state: row.state as BookingState,
  })
}

@Injectable()
export class BookingRepository implements IBookingRepository {
  public async find(_tx: Transaction, id: BookingID): Promise<Booking | null> {
    const row = await _tx.oneOrNone<Row>(
      'SELECT * FROM bookings WHERE id = $(id)',
      { id },
    )
    return row ? rowToDomain(row) : null
  }

  public async get(_tx: Transaction, id: BookingID): Promise<Booking> {
    const booking = await this.find(_tx, id)
    if (!booking) {
      throw new BookingNotFoundError(id as unknown as number)
    }
    return booking
  }

  public async insert(
    _tx: Transaction,
    data: Except<BookingProperties, 'id'>,
  ): Promise<Booking> {
    const row = await _tx.one<Row>(
      `
      INSERT INTO bookings(
        car_id,
        renter_id,
        start_date,
        end_date,
        state
      ) VALUES (
        $(carId),
        $(renterId),
        $(startDate),
        $(endDate),
        $(state)
      ) RETURNING *`,
      {
        carId: data.carId as unknown as number,
        renterId: data.renterId as unknown as number,
        startDate: data.startDate,
        endDate: data.endDate,
        state: data.state,
      },
    )
    return rowToDomain(row)
  }
}
