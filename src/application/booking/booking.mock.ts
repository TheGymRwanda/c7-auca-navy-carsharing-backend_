import { type Except } from 'type-fest'

import { type Transaction } from '../../persistence/database-connection.interface'

import { type Booking, type BookingID, type BookingProperties } from './booking'
import { type IBookingRepository } from './booking.repository.interface'
import { type IBookingService } from './booking.service.interface'

export type BookingRepositoryMock = IBookingRepository & {
  insert: jest.Mock
  get: jest.Mock
  find: jest.Mock
}

export type BookingServiceMock = IBookingService & {
  create: jest.Mock
  get: jest.Mock
}

export function mockBookingRepository(): BookingRepositoryMock {
  return {
    insert: jest.fn(),
    get: jest.fn(),
    find: jest.fn(),
  }
}

export function mockBookingService(): BookingServiceMock {
  return {
    create: jest.fn(),
    get: jest.fn(),
  }
}
