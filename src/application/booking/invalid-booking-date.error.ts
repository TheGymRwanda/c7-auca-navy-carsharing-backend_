import { CustomError } from 'ts-custom-error'

export class InvalidBookingDateError extends CustomError {
  public constructor(message: string) {
    super(message)
  }
}
