import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { boolean } from 'boolean'

import { AuthenticationConfig } from '../application'
import { DatabaseConnectionConfig } from '../persistence'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *     ██╗     PROCEED WITH CAUTION                                                                                    *
 *     ██║                                                                                                             *
 *     ██║     This file implements some core functionality for the application. You will not need to modify or        *
 *     ╚═╝     fully understand this file to successfully finish your project.                                         *
 *     ██╗                                                                                                             *
 *     ╚═╝     That said, feel free to browse around and try things - you can always revert your changes!              *
 *                                                                                                                     *
 \*********************************************************************************************************************/

@Module({
  providers: [
    {
      provide: AuthenticationConfig,
      inject: [ConfigService],
      useFactory(configService: ConfigService): AuthenticationConfig {
        return new AuthenticationConfig({
          jwtSecret: configService.getOrThrow('JWT_SECRET'),
        })
      },
    },
    {
      provide: DatabaseConnectionConfig,
      inject: [ConfigService],
      useFactory(configService: ConfigService): DatabaseConnectionConfig {
        return new DatabaseConnectionConfig({
          host: configService.getOrThrow('DB_HOST'),
          database: configService.getOrThrow('DB_NAME'),
          username: configService.getOrThrow('DB_USER'),
          password: configService.getOrThrow('DB_PASS'),
          port: Number.parseInt(configService.getOrThrow('DB_PORT')),
          ssl: boolean(configService.getOrThrow('DB_SSL')),
        })
      },
    },
  ],
  exports: [AuthenticationConfig, DatabaseConnectionConfig],
})
export class ConfigModule {}
