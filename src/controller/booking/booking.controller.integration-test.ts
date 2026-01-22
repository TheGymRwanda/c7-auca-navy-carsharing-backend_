import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import {
  BookingID,
  BookingNotFoundError,
  AccessDeniedError,
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
    startDate: new Date('2026-01-10T07:00:00.000Z'),
    endDate: new Date('2026-01-15T07:00:00.000Z'),
  }).build()

  const bookingTwo = BookingBuilder.from({
    id: 12,
    carId: 4 as CarID,
    renterId: 7 as UserID,
    state: BookingState.PENDING,
    startDate: new Date('2026-02-10T07:00:00.000Z'),
    endDate: new Date('2026-02-15T07:00:00.000Z'),
  }).build()

  let app: INestApplication
  let bookingServiceMock: BookingServiceMock

  beforeEach(async () => {
    bookingServiceMock = mockBookingService()

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
      .useValue(new AuthenticationGuardMock(user))
      .compile()

    app = moduleReference.createNestApplication()
    await configureGlobalEnhancers(app).init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('getOne', () => {
    it('should return a booking', async () => {
      bookingServiceMock.get.mockResolvedValue(bookingOne)

      await request(app.getHttpServer())
        .get(`/bookings/${bookingOne.id}`)
        .expect(HttpStatus.OK)
        .expect({
          id: 14,
          carId: 2,
          renterId: 5,
          state: BookingState.PENDING,
          startDate: '2026-01-10T07:00:00.000Z',
          endDate: '2026-01-15T07:00:00.000Z',
        })
      expect(bookingServiceMock.get).toHaveBeenCalledWith(
        bookingOne.id,
        user.id,
      )
    })

    it('should return a 401 when AccessDeniedError is thrown', async () => {
      const bookingId = 15 as BookingID
      bookingServiceMock.get.mockRejectedValue(
        new AccessDeniedError('Access denied', 0),
      )

      await request(app.getHttpServer())
        .get(`/bookings/${bookingId}`)
        .expect(HttpStatus.UNAUTHORIZED)

      expect(bookingServiceMock.get).toHaveBeenCalledWith(bookingId, user.id)
    })

    it('should return 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .get('/bookings/foo')
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 404 when booking is not found', async () => {
      const bookingId = 65 as BookingID
      bookingServiceMock.get.mockRejectedValue(
        new BookingNotFoundError(bookingId),
      )

      await request(app.getHttpServer())
        .get(`/bookings/${bookingId}`)
        .expect(HttpStatus.NOT_FOUND)
      expect(bookingServiceMock.get).toHaveBeenCalledWith(bookingId, user.id)
    })
  })

  describe('getAll', () => {
    it('should return all bookings', async () => {
      bookingServiceMock.getAll.mockResolvedValue([bookingOne, bookingTwo])

      await request(app.getHttpServer())
        .get('/bookings')
        .expect(HttpStatus.OK)
        .expect([
          {
            id: 14,
            carId: 2,
            renterId: 5,
            state: BookingState.PENDING,
            startDate: '2026-01-10T07:00:00.000Z',
            endDate: '2026-01-15T07:00:00.000Z',
          },
          {
            id: 12,
            carId: 4,
            renterId: 7,
            state: BookingState.PENDING,
            startDate: '2026-02-10T07:00:00.000Z',
            endDate: '2026-02-15T07:00:00.000Z',
          },
        ])
    })
  })

  describe('create', () => {
    it('should create a booking', async () => {
      const payload = {
        carId: 5,
        startDate: new Date('2026-03-10T07:00:00.000Z'),
        endDate: new Date('2026-03-15T07:00:00.000Z'),
      }

      const createdBooking = BookingBuilder.from({
        id: 20,
        carId: 5 as CarID,
        renterId: user.id,
        state: BookingState.PENDING,
        startDate: payload.startDate,
        endDate: payload.endDate,
      }).build()

      bookingServiceMock.create.mockResolvedValue(createdBooking)

      await request(app.getHttpServer())
        .post('/bookings')
        .send(payload)
        .expect(HttpStatus.CREATED)
        .expect({
          id: 20,
          carId: 5,
          renterId: user.id,
          state: BookingState.PENDING,
          startDate: payload.startDate,
          endDate: payload.endDate,
        })

      expect(bookingServiceMock.create).toHaveBeenCalledWith({
        carId: 5,
        renterId: user.id,
        state: BookingState.PENDING,
        startDate: new Date('2026-03-10T07:00:00.000Z'),
        endDate: new Date('2026-03-15T07:00:00.000Z'),
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
      bookingServiceMock.create.mockRejectedValue(
        new InvalidBookingDateError(
          'The start date cannot be after the end date',
        ),
      )

      await request(app.getHttpServer())
        .post('/bookings')
        .send({
          carId: 5,
          startDate: '2026-03-15T07:00:00.000Z',
          endDate: '2026-03-10T07:00:00.000Z',
        })
        .expect(HttpStatus.BAD_REQUEST)
    })
  })

  describe('patch', () => {
    it('should update booking state', async () => {
      bookingServiceMock.update.mockResolvedValue({
        ...bookingOne,
        state: BookingState.ACCEPTED,
      })

      await request(app.getHttpServer())
        .patch(`/bookings/${bookingOne.id}`)
        .send({ state: BookingState.ACCEPTED })
        .expect(HttpStatus.OK)
        .expect({
          ...bookingOne,
          state: BookingState.ACCEPTED,
        })
    })

    it('should reject invalid state transition', async () => {
      bookingServiceMock.update.mockRejectedValue(
        new Error('Invalid booking state transition'),
      )

      await request(app.getHttpServer())
        .patch(`/bookings/${bookingOne.id}`)
        .send({ state: BookingState.PICKED_UP })
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
