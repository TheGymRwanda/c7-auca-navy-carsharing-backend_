import { Module } from '@nestjs/common'

import { DatabaseConnection, IDatabaseConnection } from '../persistence'

import { ConfigModule } from './config.module'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: IDatabaseConnection,
      useClass: DatabaseConnection,
    },
  ],
  exports: [IDatabaseConnection],
})
export class DatabaseModule {}
