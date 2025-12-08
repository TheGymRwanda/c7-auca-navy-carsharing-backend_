import { type Transaction } from '../../persistence'

import { type User, type UserID } from './user'

export abstract class IUserRepository {
  public abstract find(tx: Transaction, id: UserID): Promise<User | null>

  public abstract findByName(
    tx: Transaction,
    username: string,
  ): Promise<User | null>

  public abstract get(tx: Transaction, id: UserID): Promise<User>

  public abstract getAll(tx: Transaction): Promise<User[]>
}
