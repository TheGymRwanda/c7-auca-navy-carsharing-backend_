import { Module } from '@nestjs/common'

import {
  AuthenticationService,
  BookingService,
  CarService,
  CarTypeService,
  IAuthenticationService,
  IBookingService,
  ICarService,
  ICarTypeService,
  IUserService,
  UserService,
} from '../application'

import { DatabaseModule } from './database.module'
import { RepositoryModule } from './repository.module'

@Module({
  imports: [DatabaseModule, RepositoryModule],
  providers: [
    {
      provide: IAuthenticationService,
      useClass: AuthenticationService,
    },
    {
      provide: IBookingService,
      useClass: BookingService,
    },
    {
      provide: ICarService,
      useClass: CarService,
    },
    {
      provide: ICarTypeService,
      useClass: CarTypeService,
    },
    {
      provide: IUserService,
      useClass: UserService,
    },
  ],
  exports: [
    IAuthenticationService,
    IBookingService,
    ICarService,
    ICarTypeService,
    IUserService,
  ],
})
export class ServiceModule {}
