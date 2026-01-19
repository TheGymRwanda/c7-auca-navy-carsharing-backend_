import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import {
  BookingState,
  IBookingService,
  type BookingID,
  type CarID,
  type UserID,
} from '../../application'
import { BookingBuilder, UserBuilder } from '../../builders'
import {
  AuthenticationGuardMock,
  mockBookingService,
  type BookingServiceMock,
} from '../../mocks'
import { configureGlobalEnhancers } from '../../setup-app'
import { AuthenticationGuard } from '../authentication.guard'

import { BookingController } from './booking.controller'

describe('BookingController', () => {
  const renter = UserBuilder.from({
    id: 5 as UserID,
    name: 'jane',
  }).build()

  const booking = BookingBuilder.from({
    id: 1 as BookingID,
    carId: 10 as CarID,
    renterId: 5 as UserID,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-05'),
    state: BookingState.PENDING,
  }).build()

  let app: INestApplication
  let bookingServiceMock: BookingServiceMock
  let authenticationGuardMock: AuthenticationGuardMock

  beforeEach(async () => {
    bookingServiceMock = mockBookingService()
    authenticationGuardMock = new AuthenticationGuardMock(renter)

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

  describe('create', () => {
    it('should create a booking', async () => {
      bookingServiceMock.create.mockResolvedValue(booking)

      await request(app.getHttpServer())
        .post('/bookings')
        .send({
          carId: booking.carId,
          startDate: booking.startDate,
          endDate: booking.endDate,
        })
        .expect(HttpStatus.CREATED)
        .expect({
          id: booking.id,
          carId: booking.carId,
          renterId: booking.renterId,
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
          state: BookingState.PENDING,
        })
    })

    it('should return 400 for invalid request body', async () => {
      await request(app.getHttpServer())
        .post('/bookings')
        .send({
          carId: 'invalid',
          startDate: 'not-a-date',
        })
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should set renterId to current user', async () => {
      bookingServiceMock.create.mockResolvedValue(booking)

      await request(app.getHttpServer())
        .post('/bookings')
        .send({
          carId: booking.carId,
          startDate: booking.startDate,
          endDate: booking.endDate,
        })
        .expect(HttpStatus.CREATED)

      const callArgs = bookingServiceMock.create.mock.calls[0][0]
      expect(callArgs.renterId).toBe(renter.id)
    })
  })
})
