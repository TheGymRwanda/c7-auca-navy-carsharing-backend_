import { Module } from '@nestjs/common'

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
  ],
  exports: [ICarRepository, ICarTypeRepository, IUserRepository],
})
export class RepositoryModule {}
