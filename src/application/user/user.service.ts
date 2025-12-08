import { Injectable, Logger } from '@nestjs/common'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'

import { type User, type UserID } from './user'
import { IUserRepository } from './user.repository.interface'
import { IUserService } from './user.service.interface'

@Injectable()
export class UserService implements IUserService {
  private readonly repository: IUserRepository
  private readonly databaseConnection: IDatabaseConnection
  private readonly logger: Logger

  public constructor(
    repository: IUserRepository,
    databaseConnection: IDatabaseConnection,
  ) {
    this.repository = repository
    this.databaseConnection = databaseConnection
    this.logger = new Logger(UserService.name)
  }

  public async get(id: UserID): Promise<User> {
    return this.databaseConnection.transactional(tx =>
      this.repository.get(tx, id),
    )
  }

  public async getAll(): Promise<User[]> {
    return this.databaseConnection.transactional(tx =>
      this.repository.getAll(tx),
    )
  }

  public async find(id: UserID): Promise<User | null> {
    return this.databaseConnection.transactional(tx =>
      this.repository.find(tx, id),
    )
  }

  public async findByName(name: string): Promise<User | null> {
    return this.databaseConnection.transactional(tx =>
      this.repository.findByName(tx, name),
    )
  }
}
