import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { BookingBuilder, UserBuilder } from 'src/builders'

import { BookingController } from './booking.controller'
import { AuthenticationGuard } from '../authentication.guard'
import { configureGlobalEnhancers } from 'src/setup-app'

import { AuthenticationGuardMock, type BookingServiceMock } from '../../mocks'
import { BookingState } from 'src/application/booking/booking-state'

describe('BookingController', () => {
  const user = UserBuilder.from({
    id: 21,
    name: 'Yezi',
  }).build()

  const bookingOne = BookingBuilder.from({
        id: 14,
        carId: 2,
        state: BookingState.PENDING,
        startDate: '2026-01-10T07:00:00.000Z',
        endDate: '2026-01-15T07:00:00.000Z',
  })
})
