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
import { InvalidBookingDateError } from './invalid-booking-date.error'

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

  describe('create', () => {
    it('should create a booking with PENDING state', async () => {
      const renter = new UserBuilder().build()
      const carId = 4 as CarID
      const bookingData = {
        carId,
        renterId: renter.id,
        state: BookingState.PENDING,
        startDate: '2026-01-10T07:00:00.000Z',
        endDate: '2026-01-15T07:00:00.000Z',
      }
      const expectedBooking = new BookingBuilder()
        .withCarId(carId)
        .withRenterId(renter.id)
        .withState(BookingState.PENDING)
        .withStartDate('2026-01-10T07:00:00.000Z')
        .withEndDate('2026-01-15T07:00:00.000Z')
        .build()

      bookingRepositoryMock.insert.mockResolvedValue(expectedBooking)

      const result = await bookingService.create(bookingData)

      expect(result).toEqual(expectedBooking)
      expect(bookingRepositoryMock.insert).toHaveBeenCalledWith(
        expect.anything(),
        bookingData,
      )
    })

    it('should throw an error if startDate is after endDate', async () => {
      const renter = new UserBuilder().build()
      const carId = 4 as CarID
      const bookingData = {
        carId,
        renterId: renter.id,
        state: BookingState.PENDING,
        startDate: '2026-01-15T07:00:00.000Z',
        endDate: '2026-01-10T07:00:00.000Z',
      }

      await expect(bookingService.create(bookingData)).rejects.toThrow(
        InvalidBookingDateError,
      )
    })
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
