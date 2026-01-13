import { Injectable } from '@nestjs/common'
import { type Except } from 'type-fest'

import {
  type CarID,
  type CarProperties,
  type CarState,
  type CarTypeID,
  type FuelType,
  type ICarRepository,
  type UserID,
} from '../application'
import { Car, CarNotFoundError } from '../application/car'

import { type Transaction } from './database-connection.interface'

type Row = {
  id: number
  car_type_id: number
  owner_id: number
  name: string
  state: string
  fuel_type: string
  horsepower: number
  license_plate: string | null
  info: string | null
}

// Please remove the next line when implementing this file.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function rowToDomain(row: Row): Car {
  return new Car({
    id: row.id as CarID,
    carTypeId: row.car_type_id as CarTypeID,
    ownerId: row.owner_id as UserID,
    state: row.state as CarState,
    name: row.name,
    fuelType: row.fuel_type as FuelType,
    horsepower: row.horsepower,
    licensePlate: row.license_plate,
    info: row.info,
  })
}

// Please remove the next line when implementing this file.
/* eslint-disable @typescript-eslint/require-await */

@Injectable()
export class CarRepository implements ICarRepository {
  public async find(_tx: Transaction, _id: CarID): Promise<Car | null> {
    throw new Error('Not implemented')
  }

  public async get(_tx: Transaction, _id: CarID): Promise<Car> {
    throw new Error('Not implemented')
  }

  public async getAll(_tx: Transaction): Promise<Car[]> {
    throw new Error('Not implemented')
  }

  public async findByLicensePlate(
    _tx: Transaction,
    _licensePlate: string,
  ): Promise<Car | null> {
    throw new Error('Not implemented')
  }

  public async update(_tx: Transaction, _car: Car): Promise<Car> {
    const row = await _tx.oneOrNone<Row>(
      `
      UPDATE cars SET
        car_type_id =  $(carTypeId),
        name = $(name),
        owner_id = $(ownerId),
        state =  $(state),
        fuel_type = $(fuelType),
        horsepower = $(horsepower),
        license_plate = $(licensePlate),
        info = $(info)
      WHERE id = $(id)
      RETURNING *
      `,
      { ..._car },
    )

    if (!row) {
      throw new CarNotFoundError(_car.id)
    }

    return rowToDomain(row)
  }

  public async insert(
    _tx: Transaction,
    _car: Except<CarProperties, 'id'>,
  ): Promise<Car> {
    throw new Error('Not implemented')
  }
}
