import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { type Except } from 'type-fest'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'
import { type UserID } from '../user'

import { Car, type CarID, type CarProperties } from './car'
import { ICarRepository } from './car.repository.interface'
import { type ICarService } from './car.service.interface'

@Injectable()
export class CarService implements ICarService {
  private readonly carRepository: ICarRepository
  private readonly databaseConnection: IDatabaseConnection
  private readonly logger: Logger

  public constructor(
    carRepository: ICarRepository,
    databaseConnection: IDatabaseConnection,
  ) {
    this.carRepository = carRepository
    this.databaseConnection = databaseConnection
    this.logger = new Logger(CarService.name)
  }

  // Please remove the next line when implementing this file.
  /* eslint-disable @typescript-eslint/require-await */

  public async create(_data: Except<CarProperties, 'id'>): Promise<Car> {
    throw new Error('Not implemented')
  }

  public async getAll(): Promise<Car[]> {
    throw new Error('Not implemented')
  }

  public async get(_id: CarID): Promise<Car> {
    return this.databaseConnection.transactional(tx =>
      this.carRepository.get(tx, _id),
    )
  }

  public async update(
    _carId: CarID,
    _updates: Partial<Except<CarProperties, 'id'>>,
    _currentUserId: UserID,
  ): Promise<Car> {
    if (_currentUserId === _updates.ownerId) {
      return this.databaseConnection.transactional(async tx => {
        const car = await this.carRepository.get(tx, _carId)
        const updatedCar = new Car({
          ..._updates,
          ...car,
          id: _carId,
        })
        return this.carRepository.update(tx, updatedCar)
      })
    }
    throw new UnauthorizedException(
      'User is not allowed to update a car that is not theirs.',
    )
  }
}
