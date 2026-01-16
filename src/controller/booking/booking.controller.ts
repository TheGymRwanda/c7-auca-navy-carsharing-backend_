import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger'

import { IBookingService } from 'src/application/booking/booking.service.interface'

import { AuthenticationGuard } from '../authentication.guard'

import { BookingDTO } from './booking.dto'
import { BookingID } from 'src/application'

@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description:
    'The request was not authorized because the JWT was missing, expired or otherwise invalid.',
})
@ApiInternalServerErrorResponse({
  description: 'An internal server error occurred.',
})
@UseGuards(AuthenticationGuard)
@Controller('/bookings')
export class BookingController {
  private readonly bookingService: IBookingService
  constructor(bookingService: IBookingService) {
    this.bookingService = bookingService
  }

  @Get()
  public async getAll(): Promise<BookingDTO[]> {
    return await this.bookingService.getAll()
  }

  @Get(':id')
  public async get(
    @Param('id', ParseIntPipe) id: BookingID,
  ): Promise<BookingDTO> {
    return await this.bookingService.get(id)
  }
}
