import { Module } from '@nestjs/common'

import {
  AuthenticationService,
  CarService,
  CarTypeService,
  IAuthenticationService,
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
  exports: [IAuthenticationService, ICarService, ICarTypeService, IUserService],
})
export class ServiceModule {}
