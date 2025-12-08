import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'
import { IsNetworkPort } from 'class-validator-extended'

import { validate } from '../util'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

export class DatabaseConnectionConfig {
  @IsString()
  @IsNotEmpty()
  public readonly host: string

  @IsString()
  @IsNotEmpty()
  public readonly database: string

  @IsString()
  @IsNotEmpty()
  public readonly username: string

  @IsString()
  @IsNotEmpty()
  public readonly password: string

  @IsNetworkPort({ allow_system_allocated: false })
  public readonly port: number

  @IsBoolean()
  public readonly ssl: boolean

  public constructor({
    host,
    database,
    username,
    password,
    port,
    ssl,
  }: {
    host: string
    database: string
    username: string
    password: string
    port?: number
    ssl?: boolean
  }) {
    this.host = host
    this.database = database
    this.username = username
    this.password = password
    this.port = port ?? 5432
    this.ssl = ssl ?? false

    validate(this)
  }
}
