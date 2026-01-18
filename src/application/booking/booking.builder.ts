import { Except } from 'type-fest'

import { type CarID, CarState } from '../car'
import { type UserID } from '../user'

import { BookingID, BookingProperties } from './booking'

type UntaggedBookingProperties = Except<
  BookingProperties,
  'id' | 'carId' | 'renterId'
> & { id: number; carId: CarID; renterId: UserID }

export class BookingBuilder {
  private readonly properties: UntaggedBookingProperties = {
    id: 14 as BookingID,
    carId: 2 as CarID,
    renterId: 1 as UserID,
    state: CarState.LOCKED,
    startDate: '2025-12-15T07:00:00.000Z',
    endDate: '2026-01-15T07:00:00.000Z',
  }
}

// {
//         "id": 1,
//         "carId": 2,
//         "renterId": 1,
//         "state": "LOCKED",
//         "startDate": "2026-01-15T07:00:00.000Z",
//         "endDate": "2026-01-28T16:00:00.000Z"
//     },
