import { Module } from '@nestjs/common'

import {
  IBookingRepository,
  ICarRepository,
  ICarTypeRepository,
  IUserRepository,
} from '../application'
import {
  BookingRepository,
  CarRepository,
  CarTypeRepository,
  UserRepository,
} from '../persistence'

@Module({
  providers: [
    {
      provide: IBookingRepository,
      useClass: BookingRepository,
    },
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
  ],
  exports: [
    IBookingRepository,
    ICarRepository,
    ICarTypeRepository,
    IUserRepository,
  ],
})
export class RepositoryModule {}
