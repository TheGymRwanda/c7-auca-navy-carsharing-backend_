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
} from 'src/application'
import { IBookingRepository } from 'src/application/booking/booking.repository.interface'

import { Transaction } from './database-connection.interface'

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
  public get(_tx: Transaction, id: BookingID): Promise<Booking> {
    throw new Error('Not implemented')
  }

  public getAll(_tx: Transaction): Promise<Booking[]> {
    throw new Error('Not implemented')
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
