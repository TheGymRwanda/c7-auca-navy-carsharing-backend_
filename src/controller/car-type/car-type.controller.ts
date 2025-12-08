import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { CarType, type CarTypeID, ICarTypeService } from '../../application'
import { AuthenticationGuard } from '../authentication.guard'

import { CarTypeDTO, CreateCarTypeDTO, PatchCarTypeDTO } from './car-type.dto'

@ApiTags(CarType.name)
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description:
    'The request was not authorized because the JWT was missing, expired or otherwise invalid.',
})
@ApiInternalServerErrorResponse({
  description: 'An internal server error occurred.',
})
@UseGuards(AuthenticationGuard)
@Controller('/car-types')
export class CarTypeController {
  private readonly carTypeService: ICarTypeService

  public constructor(carTypeService: ICarTypeService) {
    this.carTypeService = carTypeService
  }

  @ApiOperation({
    summary: 'Retrieve all car types.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: [CarTypeDTO],
  })
  @Get()
  public async getAll(): Promise<CarTypeDTO[]> {
    const carTypes = await this.carTypeService.getAll()

    return carTypes.map(carType => CarTypeDTO.fromModel(carType))
  }

  @ApiOperation({
    summary: 'Retrieve a specific car type.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: CarTypeDTO,
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiNotFoundResponse({
    description: 'No car type with the given id was found.',
  })
  @Get(':id')
  public async get(
    @Param('id', ParseIntPipe) id: CarTypeID,
  ): Promise<CarTypeDTO> {
    const carType = await this.carTypeService.get(id)

    return CarTypeDTO.fromModel(carType)
  }

  @ApiOperation({
    summary: 'Create a new car type.',
    // This isn't the case yet - it will be implemented in "Roles and Rights - Module 1".
    description: 'This route is only available to administrators,',
  })
  @ApiCreatedResponse({
    description: 'A new car type was created.',
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @Post()
  public async create(@Body() data: CreateCarTypeDTO): Promise<CarTypeDTO> {
    const carType = await this.carTypeService.create(data)

    return CarTypeDTO.fromModel(carType)
  }

  @ApiOperation({
    summary: 'Update an existing car type.',
    // This isn't the case yet - it will be implemented in "Roles and Rights - Module 1".
    description: 'This route is only available to administrators,',
  })
  @ApiOkResponse({
    description: 'The car type was updated.',
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiNotFoundResponse({
    description: 'No car type with the given id was found.',
  })
  @Patch(':id')
  public async patch(
    @Param('id', ParseIntPipe) carTypeId: CarTypeID,
    @Body() data: PatchCarTypeDTO,
  ): Promise<CarTypeDTO> {
    const carType = await this.carTypeService.update(carTypeId, data)

    return CarTypeDTO.fromModel(carType)
  }
}
