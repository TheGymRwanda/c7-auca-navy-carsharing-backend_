import { CustomError } from 'ts-custom-error'

export class DuplicateLicensePlateError extends CustomError {
  public readonly licensePlate: string

  public constructor(licensePlate: string) {
    super(`A car with this license plate already exists`)

    this.licensePlate = licensePlate
  }
}
