import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { BookingController } from 'src/controller/booking'

import { AuthenticationConfig } from '../application'
import {
  AuthenticationController,
  CarController,
  CarTypeController,
  UserController,
} from '../controller'

import { ConfigModule } from './config.module'
import { ServiceModule } from './service.module'

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [AuthenticationConfig],
      useFactory(config: AuthenticationConfig) {
        return {
          secret: config.jwtSecret,
          signOptions: { expiresIn: '1d' },
        }
      },
    }),
    ServiceModule,
    ConfigModule,
  ],
  controllers: [
    AuthenticationController,
    CarController,
    CarTypeController,
    UserController,
    BookingController,
  ],
})
export class ControllerModule {}
