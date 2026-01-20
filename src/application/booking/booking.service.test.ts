import { UserBuilder } from 'src/builders'

import {
  type BookingRepositoryMock,
  type DatabaseConnectionMock,
  mockDatabaseConnection,
  mockBookingRepository,
} from '../../mocks'
import { CarID } from '../car'

import { BookingState } from './booking-state'
import { BookingBuilder } from './booking.builder'
import { BookingService } from './booking.service'

describe('BookingService', () => {
  let bookingService: BookingService
  let databaseConnectionMock: DatabaseConnectionMock
  let bookingRepositoryMock: BookingRepositoryMock

  beforeEach(() => {
    bookingRepositoryMock = mockBookingRepository()
    databaseConnectionMock = mockDatabaseConnection()

    bookingService = new BookingService(
      databaseConnectionMock,
      bookingRepositoryMock,
    )
  })

  describe('update', () => {
    xit('should update a booking', async () => {
      const renter = new UserBuilder().build()
      const carId = 4 as CarID
      const booking = new BookingBuilder()
        .withCarId(carId)
        .withState(BookingState.PENDING)
        .withRenterId(renter.id)
        .build()
      const updatedBooking = BookingBuilder.from(booking)
        .withState(BookingState.ACCEPTED)
        .build()

      await expect(
        bookingService.update(updatedBooking, booking.id, renter.id),
      ).resolves.toEqual(updatedBooking)
    })

    xit('should deny an update with invalid booking transition', async () => {
      const renter = new UserBuilder().build()
      const carId = 5 as CarID
      const booking = new BookingBuilder()
        .withCarId(carId)
        .withState(BookingState.PENDING)
        .withRenterId(renter.id)
        .build()
      const updatedBooking = BookingBuilder.from(booking)
        .withState(BookingState.PICKED_UP)
        .build()

      await expect(
        bookingService.update(updatedBooking, booking.id, renter.id),
      ).resolves.toReject()
    })
  })
})
