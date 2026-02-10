import { Module } from '@nestjs/common'

import { IBookingRepository } from 'src/application/booking/booking.repository.interface'
import { BookingRepository } from 'src/persistence/booking.repository'

import {
  ICarRepository,
  ICarTypeRepository,
  IUserRepository,
} from '../application'
import {
  CarRepository,
  CarTypeRepository,
  UserRepository,
} from '../persistence'

@Module({
  providers: [
    {
      provide: ICarRepository,
      useClass: CarRepository,
    },
    {
      provide: ICarTypeRepository,
      useClass: CarTypeRepository,
    },
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IBookingRepository,
      useClass: BookingRepository,
    },
  ],
  exports: [
    ICarRepository,
    ICarTypeRepository,
    IUserRepository,
    IBookingRepository,
  ],
})
export class RepositoryModule {}
