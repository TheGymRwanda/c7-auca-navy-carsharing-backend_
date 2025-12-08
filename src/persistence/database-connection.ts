import { Injectable, type OnApplicationShutdown } from '@nestjs/common'
import pgPromise, { type IDatabase } from 'pg-promise'

import { DatabaseConnectionConfig } from './database-connection.config'
import {
  type IDatabaseConnection,
  type Transaction,
} from './database-connection.interface'

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

@Injectable()
export class DatabaseConnection
  implements IDatabaseConnection, OnApplicationShutdown
{
  private readonly connection: IDatabase<unknown>

  public constructor(config: DatabaseConnectionConfig) {
    this.connection = pgPromise()({
      host: config.host,
      database: config.database,
      port: config.port,
      user: config.username,
      password: config.password,
      ssl: config.ssl,
    })
  }

  public transactional<T>(
    callback: (tx: Transaction) => Promise<T>,
  ): Promise<T> {
    return this.connection.tx(callback)
  }

  // When the application is shut down, we want to properly clean up after ourselves. In this case this means we want to
  // close all database connections.
  public async onApplicationShutdown(_signal?: string): Promise<void> {
    await this.connection.$pool.end()
  }
}
