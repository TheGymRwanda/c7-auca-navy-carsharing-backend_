import { NotFoundError } from '../not-found.error'

import { type UserID } from './user'

export class UserNotFoundError extends NotFoundError<UserID> {
  public constructor(userId: UserID) {
    super('User not found', userId)
  }
}
