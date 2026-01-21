import { CarBuilder, UserBuilder } from 'src/builders'

import {
  type BookingRepositoryMock,
  type DatabaseConnectionMock,
  mockDatabaseConnection,
  mockBookingRepository,
  type CarRepositoryMock,
  mockCarRepository,
} from '../../mocks'
import { AccessDeniedError, BookingID, CarID, UserID } from '../index'

import { BookingState } from './booking-state'
import { BookingBuilder } from './booking.builder'
import { BookingService } from './booking.service'
import { InvalidBookingDateError } from './invalid-booking-date.error'

describe('BookingService', () => {
  let bookingService: BookingService
  let databaseConnectionMock: DatabaseConnectionMock
  let bookingRepositoryMock: BookingRepositoryMock
  let carRepositoryMock: CarRepositoryMock

  beforeEach(() => {
    bookingRepositoryMock = mockBookingRepository()
    databaseConnectionMock = mockDatabaseConnection()
    carRepositoryMock = mockCarRepository()

    bookingService = new BookingService(
      databaseConnectionMock,
      bookingRepositoryMock,
      carRepositoryMock,
    )
  })

  describe('get', () => {
    it('should return a booking if user is renter', async () => {
      const renter = new UserBuilder().build()
      const car = new CarBuilder().build()
      const booking = new BookingBuilder()
        .withCarId(car.id)
        .withRenterId(renter.id)
        .build()

      bookingRepositoryMock.get.mockResolvedValue(booking)
      carRepositoryMock.get.mockResolvedValue(car)

      const result = await bookingService.get(booking.id, renter.id)

      expect(result).toEqual(booking)
    })

    it('should return a booking if user is owner', async () => {
      const owner = new UserBuilder().build()
      const car = new CarBuilder().withOwner(owner.id).build()
      const booking = new BookingBuilder().withCarId(car.id).build()

      bookingRepositoryMock.get.mockResolvedValue(booking)
      carRepositoryMock.get.mockResolvedValue(car)

      const result = await bookingService.get(booking.id, owner.id)

      expect(result).toEqual(booking)
    })

    it('should throw AccessDeniedError if user is neither renter nor owner', async () => {
      const otherUser = new UserBuilder().withId(999).build()
      const car = new CarBuilder()
        .withId(50 as CarID)
        .withOwner(100)
        .build()
      const booking = new BookingBuilder()
        .withId(10 as BookingID)
        .withCarId(car.id)
        .withRenterId(200 as UserID)
        .build()

      bookingRepositoryMock.get.mockResolvedValue(booking)
      carRepositoryMock.get.mockResolvedValue(car)

      await expect(
        bookingService.get(booking.id, otherUser.id),
      ).rejects.toThrow(AccessDeniedError)
    })
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
    xit('should uupdate a booking', async () => {
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

      const car = new CarBuilder().withId(carId).build()
      bookingRepositoryMock.get.mockResolvedValue(booking)
      carRepositoryMock.get.mockResolvedValue(car)

      await expect(
        bookingService.update(updatedBooking, booking.id, renter.id),
      ).resolves.toEqual(updatedBooking)
    })
  })
})
