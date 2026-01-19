import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthenticationConfig } from '../application'
import {
  AuthenticationController,
  BookingController,
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
    BookingController,
    CarController,
    CarTypeController,
    UserController,
  ],
})
export class ControllerModule {}
