import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import {
  BookingID,
  BookingNotFoundError,
  CarID,
  IBookingService,
  UserID,
} from 'src/application'
import { BookingState } from 'src/application/booking/booking-state'
import { BookingBuilder, UserBuilder } from 'src/builders'
import { configureGlobalEnhancers } from 'src/setup-app'

import {
  AuthenticationGuardMock,
  mockBookingService,
  BookingServiceMock,
} from '../../mocks'
import { AuthenticationGuard } from '../authentication.guard'

import { BookingController } from './booking.controller'

describe('BookingController', () => {
  const user = UserBuilder.from({
    id: 21,
    name: 'Yezi',
  }).build()

  const bookingOne = BookingBuilder.from({
    id: 14,
    carId: 2 as CarID,
    renterId: 5 as UserID,
    state: BookingState.PENDING,
    startDate: '2026-01-10T07:00:00.000Z',
    endDate: '2026-01-15T07:00:00.000Z',
  }).build()

  const bookingTwo = BookingBuilder.from({
    id: 12,
    carId: 4 as CarID,
    renterId: 7 as UserID,
    state: BookingState.PENDING,
    startDate: '2026-02-10T07:00:00.000Z',
    endDate: '2026-02-15T07:00:00.000Z',
  }).build()

  let app: INestApplication
  let bookingServiceMock: BookingServiceMock
  let authenticationGuardMock: AuthenticationGuardMock

  beforeEach(async () => {
    bookingServiceMock = mockBookingService()
    authenticationGuardMock = new AuthenticationGuardMock(user)

    const moduleReference = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: IBookingService,
          useValue: bookingServiceMock,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(authenticationGuardMock)
      .compile()

    app = moduleReference.createNestApplication()
    await configureGlobalEnhancers(app).init()
  })

  afterEach(() => app.close())

  describe('getOne', () => {
    it('should return a booking', async () => {
      bookingServiceMock.get.mockResolvedValue(bookingOne)
      await request(app.getHttpServer())
        .get(`/bookings/${bookingOne.id}`)
        .expect(HttpStatus.OK)
        .expect({
          id: 14,
          carId: 2 as CarID,
          renterId: 5 as UserID,
          state: BookingState.PENDING,
          startDate: '2026-01-10T07:00:00.000Z',
          endDate: '2026-01-15T07:00:00.000Z',
        })
    })

    it('should return a 400', async () => {
      await request(app.getHttpServer())
        .get(`/bookings/foo`)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return a 404', async () => {
      const bookingId = 65 as BookingID
      bookingServiceMock.get.mockRejectedValue(
        new BookingNotFoundError(bookingId),
      )

      await request(app.getHttpServer())
        .get(`/car/${bookingId}`)
        .expect(HttpStatus.NOT_FOUND)
    })
  })

  describe('getAll', () => {
    it('should return all bookings', async () => {
      bookingServiceMock.getAll.mockResolvedValue([bookingOne, bookingTwo])
      await request(app.getHttpServer())
        .get(`/bookings`)
        .expect(HttpStatus.OK)
        .expect([
          {
            id: 14,
            carId: 2 as CarID,
            renterId: 5 as UserID,
            state: BookingState.PENDING,
            startDate: '2026-01-10T07:00:00.000Z',
            endDate: '2026-01-15T07:00:00.000Z',
          },
          {
            id: 12,
            carId: 4 as CarID,
            renterId: 7 as UserID,
            state: BookingState.PENDING,
            startDate: '2026-02-10T07:00:00.000Z',
            endDate: '2026-02-15T07:00:00.000Z',
          },
        ])
    })
  })
})
