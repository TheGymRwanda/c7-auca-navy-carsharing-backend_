import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Patch,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger'

import { AccessDeniedError, Booking, BookingID, User } from 'src/application'
import { BookingInvalidError } from 'src/application/booking/booking-invalid-error'
import { BookingState } from 'src/application/booking/booking-state'
import { IBookingService } from 'src/application/booking/booking.service.interface'
import { InvalidBookingDateError } from 'src/application/booking/invalid-booking-date.error'

import { AuthenticationGuard } from '../authentication.guard'
import { CurrentUser } from '../current-user.decorator'

import { BookingDTO, CreateBookingDTO, PatchBookingDTO } from './booking.dto'

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
  @ApiUnauthorizedResponse({
    description: 'The user is not allowed to access this booking',
  })
  @Get(':id')
  public async get(
    @Param('id', ParseIntPipe) id: BookingID,
    @CurrentUser() user: User,
  ): Promise<BookingDTO> {
    try {
      return await this.bookingService.get(id, user.id)
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        throw new UnauthorizedException(error.message)
      }
      throw error
    }
  }
  @ApiOperation({
    summary: 'Create a new booking',
  })
  @ApiCreatedResponse({
    description: 'The booking was created successfully.',
    type: BookingDTO,
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. invalid params or property in request body',
  })
  @Post()
  public async create(
    @Body() data: CreateBookingDTO,
    @CurrentUser() user: User,
  ): Promise<BookingDTO> {
    try {
      const booking = await this.bookingService.create({
        ...data,
        renterId: user.id,
        state: BookingState.PENDING,
      })
      return BookingDTO.fromModel(booking)
    } catch (error) {
      if (error instanceof InvalidBookingDateError) {
        throw new BadRequestException(error.message)
      }
      throw error
    }
  }

  @Patch(':id')
  public async patch(
    @Body() data: PatchBookingDTO,
    @Param('id', ParseIntPipe) id: BookingID,
    @CurrentUser() user: User,
  ): Promise<BookingDTO> {
    try {
      return await this.bookingService.update(data, id, user.id)
    } catch (error) {
      if (error instanceof BookingInvalidError) {
        throw new BookingInvalidError(id)
      }
      throw error
    }
  }
}
