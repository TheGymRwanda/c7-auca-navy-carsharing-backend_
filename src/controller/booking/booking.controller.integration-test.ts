import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import {
  BookingID,
  BookingNotFoundError,
  CarID,
  IBookingService,
  UserID,
  InvalidBookingDateError,
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

  describe('create', () => {
    it('should create a booking and return 201', async () => {
      const createBookingData = {
        carId: 5,
        startDate: '2026-03-10T07:00:00.000Z',
        endDate: '2026-03-15T07:00:00.000Z',
      }

      const createdBooking = BookingBuilder.from({
        id: 20,
        carId: 5 as CarID,
        renterId: user.id,
        state: BookingState.PENDING,
        startDate: '2026-03-10T07:00:00.000Z',
        endDate: '2026-03-15T07:00:00.000Z',
      }).build()

      bookingServiceMock.create.mockResolvedValue(createdBooking)

      await request(app.getHttpServer())
        .post('/bookings')
        .send(createBookingData)
        .expect(HttpStatus.CREATED)
        .expect({
          id: 20,
          carId: 5,
          renterId: user.id,
          state: BookingState.PENDING,
          startDate: '2026-03-10T07:00:00.000Z',
          endDate: '2026-03-15T07:00:00.000Z',
        })

      expect(bookingServiceMock.create).toHaveBeenCalledWith({
        carId: 5,
        renterId: user.id,
        state: BookingState.PENDING,
        startDate: '2026-03-10T07:00:00.000Z',
        endDate: '2026-03-15T07:00:00.000Z',
      })
    })

    it('should return 400 when carId is missing', async () => {
      const invalidData = {
        startDate: '2026-03-10T07:00:00.000Z',
        endDate: '2026-03-15T07:00:00.000Z',
      }

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 400 when startDate is invalid', async () => {
      const invalidData = {
        carId: 5,
        startDate: 'invalid-date',
        endDate: '2026-03-15T07:00:00.000Z',
      }

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 400 when endDate is invalid', async () => {
      const invalidData = {
        carId: 5,
        startDate: '2026-03-10T07:00:00.000Z',
        endDate: 'invalid-date',
      }

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 400 when carId is not a positive integer', async () => {
      const invalidData = {
        carId: -1,
        startDate: '2026-03-10T07:00:00.000Z',
        endDate: '2026-03-15T07:00:00.000Z',
      }

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 400 when startDate is after endDate', async () => {
      const invalidData = {
        carId: 5,
        startDate: '2026-03-15T07:00:00.000Z',
        endDate: '2026-03-10T07:00:00.000Z',
      }

      bookingServiceMock.create.mockRejectedValue(
        new InvalidBookingDateError(
          'The start date cannot be after the end date',
        ),
      )

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidData)
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
