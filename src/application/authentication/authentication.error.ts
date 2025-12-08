import { CustomError } from 'ts-custom-error'

export enum Reason {
  USER_NOT_FOUND = 'user not found',
  INVALID_PASSWORD = 'invalid password',
}

export class AuthenticationError extends CustomError {
  public constructor(reason: Reason) {
    super(`Authentication failed: ${reason}`)
  }
}
