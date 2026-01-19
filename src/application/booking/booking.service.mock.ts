import { type IBookingService } from './booking.service.interface'

export type BookingServiceMock = jest.Mock<IBookingService>

export function mockBookingService() {
  return {
    get: jest.fn(),
    getAll: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  }
}
