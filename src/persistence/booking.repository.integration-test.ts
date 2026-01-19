import {
  setupIntegrationTest,
  users,
  cars,
} from '../../jest.integration-test-setup'
import {
  type BookingID,
  BookingNotFoundError,
  BookingState,
} from '../application'

import { BookingRepository } from './booking.repository'

describe('BookingRepository', () => {
  const { execute } = setupIntegrationTest()

  let bookingRepository: BookingRepository

  beforeEach(() => {
    bookingRepository = new BookingRepository()
  })

  describe('insert', () => {
    it('should insert a booking', async () => {
      const startDate = new Date('2024-02-01')
      const endDate = new Date('2024-02-05')

      const booking = await execute(tx =>
        bookingRepository.insert(tx, {
          carId: cars.beatrice.id,
          renterId: users.bob.id,
          startDate,
          endDate,
          state: BookingState.PENDING,
        }),
      )

      expect(booking.carId).toBe(cars.beatrice.id)
      expect(booking.renterId).toBe(users.bob.id)
      expect(booking.startDate).toEqual(startDate)
      expect(booking.endDate).toEqual(endDate)
      expect(booking.state).toBe(BookingState.PENDING)
    })
  })

  describe('get', () => {
    it('should retrieve a booking by id', async () => {
      const startDate = new Date('2024-02-01')
      const endDate = new Date('2024-02-05')

      const insertedBooking = await execute(tx =>
        bookingRepository.insert(tx, {
          carId: cars.beatrice.id,
          renterId: users.bob.id,
          startDate,
          endDate,
          state: BookingState.PENDING,
        }),
      )

      const retrieved = await execute(tx =>
        bookingRepository.get(tx, insertedBooking.id),
      )

      expect(retrieved).toEqual(insertedBooking)
    })

    it('should throw if booking does not exist', async () => {
      await expect(
        execute(tx => bookingRepository.get(tx, 99 as BookingID)),
      ).rejects.toThrow(BookingNotFoundError)
    })
  })

  describe('find', () => {
    it('should return null if booking does not exist', async () => {
      const result = await execute(tx =>
        bookingRepository.find(tx, 99 as BookingID),
      )

      expect(result).toBeNull()
    })

    it('should return booking if it exists', async () => {
      const startDate = new Date('2024-02-01')
      const endDate = new Date('2024-02-05')

      const insertedBooking = await execute(tx =>
        bookingRepository.insert(tx, {
          carId: cars.beatrice.id,
          renterId: users.bob.id,
          startDate,
          endDate,
          state: BookingState.PENDING,
        }),
      )

      const found = await execute(tx =>
        bookingRepository.find(tx, insertedBooking.id),
      )

      expect(found).toEqual(insertedBooking)
    })
  })
})
