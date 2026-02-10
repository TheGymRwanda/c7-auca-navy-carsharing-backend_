import type { IBookingRepository } from './booking.repository.interface'

export type BookingRepositoryMock = jest.Mocked<IBookingRepository>

export function mockBookingRepository() {
  return {
    get: jest.fn(),
    getAll: jest.fn(),
    insert: jest.fn(),
    findRenterBooking: jest.fn(),
    update: jest.fn(),
    findOverlappingBooking: jest.fn(),
  }
}
