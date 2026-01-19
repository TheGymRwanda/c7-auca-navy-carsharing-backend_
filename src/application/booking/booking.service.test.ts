import {
  mockBookingRepository,
  mockDatabaseConnection,
  type BookingRepositoryMock,
  type DatabaseConnectionMock,
} from '../../mocks'

import { BookingState } from './booking-state'
import { BookingBuilder } from './booking.builder'
import { BookingService } from './booking.service'

describe('BookingService', () => {
  let bookingService: BookingService
  let bookingRepositoryMock: BookingRepositoryMock
  let databaseConnectionMock: DatabaseConnectionMock

  beforeEach(() => {
    bookingRepositoryMock = mockBookingRepository()
    databaseConnectionMock = mockDatabaseConnection()
    bookingService = new BookingService(
      bookingRepositoryMock,
      databaseConnectionMock,
    )
  })

  describe('create', () => {
    it('should create a booking with PENDING state', async () => {
      const booking = new BookingBuilder().build()
      bookingRepositoryMock.insert.mockResolvedValue(booking)
      databaseConnectionMock.transactional.mockImplementation(
        async (callback: (tx: any) => Promise<any>) => callback(undefined),
      )

      const result = await bookingService.create({
        carId: booking.carId,
        renterId: booking.renterId,
        startDate: booking.startDate,
        endDate: booking.endDate,
      })

      expect(result).toEqual(booking)
      expect(bookingRepositoryMock.insert).toHaveBeenCalled()
      expect(databaseConnectionMock.transactional).toHaveBeenCalled()
    })

    it('should set state to PENDING when creating', async () => {
      const booking = new BookingBuilder()
        .withState(BookingState.PENDING)
        .build()
      bookingRepositoryMock.insert.mockResolvedValue(booking)
      databaseConnectionMock.transactional.mockImplementation(
        async (callback: (tx: any) => Promise<any>) => callback(undefined),
      )

      await bookingService.create({
        carId: booking.carId,
        renterId: booking.renterId,
        startDate: booking.startDate,
        endDate: booking.endDate,
      })

      const callArgs = bookingRepositoryMock.insert.mock.calls[0] as any[]
      expect((callArgs[1] as any).state).toBe(BookingState.PENDING)
    })
  })

  describe('get', () => {
    it('should retrieve a booking by id', async () => {
      const booking = new BookingBuilder().build()
      bookingRepositoryMock.get.mockResolvedValue(booking)
      databaseConnectionMock.transactional.mockImplementation(
        async (callback: (tx: any) => Promise<any>) => callback(undefined),
      )

      const result = await bookingService.get(booking.id)

      expect(result).toEqual(booking)
      expect(bookingRepositoryMock.get).toHaveBeenCalled()
    })
  })
})
