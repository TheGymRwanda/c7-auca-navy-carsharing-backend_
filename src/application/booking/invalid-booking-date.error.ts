import { BadRequestException } from '@nestjs/common'

export class InvalidBookingDateError extends BadRequestException {
  public constructor(message: string) {
    super(message)
  }
}
