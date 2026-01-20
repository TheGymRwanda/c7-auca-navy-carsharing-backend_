import { Controller, Get, Param, ParseIntPipe, UseGuards, Patch, Body} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger'

import { Booking, BookingID, User } from 'src/application'
import { IBookingService } from 'src/application/booking/booking.service.interface'

import { AuthenticationGuard } from '../authentication.guard'

import { BookingDTO, PatchBookingDTO } from './booking.dto'
import { CurrentUser } from '../current-user.decorator'

@ApiTags(Booking.name)
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

  @ApiOperation({
    summary: 'Retrieve all bookings',
  })
  @ApiOkResponse({
    description: 'The bookings was retrieved successfully',
    type: [BookingDTO],
  })
  @Get()
  public async getAll(): Promise<BookingDTO[]> {
    return await this.bookingService.getAll()
  }

  @ApiOperation({
    summary: 'Retrieve a specific booking by id',
  })
  @ApiOkResponse({
    description: 'The booking was successfully retrieved.',
    type: BookingDTO,
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. invalid params or property in request body',
  })
  @ApiNotFoundResponse({
    description: 'No booking with the given id was found',
  })
  @Get(':id')
  public async get(
    @Param('id', ParseIntPipe) id: BookingID,
  ): Promise<BookingDTO> {
    return await this.bookingService.get(id)
  }
  @Patch(':id')
  public async patch(
    @Body() data: PatchBookingDTO,
    @Param('id') id: BookingID,
    @CurrentUser() user: User,
  ) {
    return await this.bookingService.update(data, id, user.id)
  }
}
