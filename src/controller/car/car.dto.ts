import { ApiProperty, PickType } from '@nestjs/swagger'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator'
import { Nullable } from 'class-validator-extended'
import { type Writable } from 'type-fest'

import {
  type Car,
  type CarID,
  CarState,
  type CarTypeID,
  FuelType,
  type UserID,
} from '../../application'
import { StrictPartialType, validate } from '../../util'

export class CarDTO {
  @ApiProperty({
    description: 'The id of the car.',
    type: 'integer',
    minimum: 1,
    example: 13,
    readOnly: true,
  })
  @IsInt()
  @IsPositive()
  public readonly id!: CarID

  @ApiProperty({
    description: 'The id of the car type.',
    type: 'integer',
    minimum: 1,
    example: 23,
  })
  @IsInt()
  @IsPositive()
  public readonly carTypeId!: CarTypeID

  @ApiProperty({
    description: 'The name of this car.',
    minLength: 1,
    example: `That's my mom's old car.`,
  })
  @IsString()
  @IsNotEmpty()
  public readonly name!: string

  @ApiProperty({
    description: 'The id of the user who owns this car.',
    type: 'integer',
    minimum: 1,
    example: 42,
  })
  @IsInt()
  @IsPositive()
  public readonly ownerId!: UserID

  @ApiProperty({
    description: 'The current state of the car.',
    enum: CarState,
    example: CarState.LOCKED,
  })
  @IsEnum(CarState)
  public readonly state!: CarState

  @ApiProperty({
    description: 'The fuel type for this car.',
    enum: FuelType,
    example: FuelType.ELECTRIC,
  })
  @IsEnum(FuelType)
  public readonly fuelType!: FuelType

  @ApiProperty({
    description: 'The amount of HP this car has.',
    type: 'integer',
    minimum: 1,
    example: 120,
  })
  @IsInt()
  @IsPositive()
  public readonly horsepower!: number

  @ApiProperty({
    description: 'The license plate of this car.',
    type: String,
    minLength: 1,
    example: 'M-X 5',
    nullable: true,
  })
  @Nullable()
  @IsString()
  @IsNotEmpty()
  public readonly licensePlate!: string | null

  @ApiProperty({
    description: 'Additional information about this car.',
    type: String,
    example: 'A booster seat is in the trunk.',
    nullable: true,
  })
  @Nullable()
  @IsString()
  public readonly info!: string | null

  public static create(data: {
    id: CarID
    carTypeId: CarTypeID
    name: string
    state: CarState
    ownerId: UserID
    fuelType: FuelType
    horsepower: number
    licensePlate: string | null
    info: string | null
  }): CarDTO {
    const instance = new CarDTO() as Writable<CarDTO>

    instance.id = data.id
    instance.carTypeId = data.carTypeId
    instance.name = data.name
    instance.state = data.state
    instance.ownerId = data.ownerId
    instance.fuelType = data.fuelType
    instance.horsepower = data.horsepower
    instance.licensePlate = data.licensePlate
    instance.info = data.info

    return validate(instance)
  }

  public static fromModel(car: Car): CarDTO {
    return CarDTO.create(car)
  }
}

export class CreateCarDTO extends PickType(CarDTO, [
  'carTypeId',
  'name',
  'fuelType',
  'horsepower',
  'state',
  'ownerId',
  'licensePlate',
  'info',
] as const) {}

export class PatchCarDTO extends StrictPartialType(
  PickType(CarDTO, ['name', 'state', 'licensePlate', 'info'] as const),
) {}
