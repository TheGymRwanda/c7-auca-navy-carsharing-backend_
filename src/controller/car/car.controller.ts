import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { DuplicateLicensePlateError } from 'src/application/car/error'

import { Car, type CarID, ICarService, type User } from '../../application'
import { AuthenticationGuard } from '../authentication.guard'
import { CurrentUser } from '../current-user.decorator'

import { CarDTO, CreateCarDTO, PatchCarDTO } from './car.dto'

@ApiTags(Car.name)
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description:
    'The request was not authorized because the JWT was missing, expired or otherwise invalid.',
})
@ApiInternalServerErrorResponse({
  description: 'An internal server error occurred.',
})
@UseGuards(AuthenticationGuard)
@Controller('/cars')
export class CarController {
  private readonly carService: ICarService

  public constructor(carService: ICarService) {
    this.carService = carService
  }

  // Please remove the next line when implementing this file.
  /* eslint-disable @typescript-eslint/require-await */

  @ApiOperation({
    summary: 'Retrieve all cars.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: [CarDTO],
  })
  @Get()
  public async getAll(): Promise<CarDTO[]> {
    const cars = await this.carService.getAll()
    return cars.map(car => CarDTO.fromModel(car))
  }

  @ApiOperation({
    summary: 'Retrieve a specific car.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: CarDTO,
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiNotFoundResponse({
    description: 'No car with the given id was found.',
  })
  @Get(':id')
  public async get(@Param('id', ParseIntPipe) _id: CarID): Promise<CarDTO> {
    const car = await this.carService.get(_id)
    return CarDTO.fromModel(car)
  }

  @ApiOperation({
    summary: 'Create a new car.',
  })
  @ApiCreatedResponse({
    description: 'A new car was created.',
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiConflictResponse({
    description: 'A car with the given license plate already exists.',
  })
  @ApiBadRequestResponse({
    description: 'A car with the license already exists.',
  })
  @Post()
  public async create(
    @CurrentUser() _owner: User,
    @Body() _data: CreateCarDTO,
  ): Promise<CarDTO | undefined> {
    try {
      const car = await this.carService.create(_data)
      return CarDTO.fromModel(car)
    } catch (error) {
      if (error instanceof DuplicateLicensePlateError) {
        throw new BadRequestException(error.message)
      }
    }
  }

  @ApiOperation({
    summary: 'Update an existing car.',
  })
  @ApiOkResponse({
    description: 'The car was updated.',
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiNotFoundResponse({
    description: 'No car with the given id was found.',
  })
  @ApiBadRequestResponse({
    description: 'A car with the license already exists.',
  })
  @Patch(':id')
  public async patch(
    @CurrentUser() _user: User,
    @Param('id', ParseIntPipe) _carId: CarID,
    @Body() _data: PatchCarDTO,
  ): Promise<CarDTO | undefined> {
    try {
      return await this.carService.update(_carId, _data, _user.id)
    } catch (error) {
      if (error instanceof DuplicateLicensePlateError) {
        throw new BadRequestException(
          'The license already exists',
          error.message,
        )
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(
          'This user is not allowed to perform the following operation.',
          error.message,
        )
      }
    }
  }
}
