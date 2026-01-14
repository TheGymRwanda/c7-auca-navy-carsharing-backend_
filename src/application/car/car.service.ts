import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { type Except } from 'type-fest'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'
import { type UserID } from '../user'

import { Car, type CarID, type CarProperties } from './car'
import { ICarRepository } from './car.repository.interface'
import { type ICarService } from './car.service.interface'
import { DuplicateLicensePlateError } from './error'
import checkLicenseExists from './utils/check-license-exists'

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
    const licenseExists = await checkLicenseExists(_data, this)
    if (licenseExists && _data.licensePlate !== null) {
      throw new DuplicateLicensePlateError(_data.licensePlate)
    }
    return this.databaseConnection.transactional(tx =>
      this.carRepository.insert(tx, _data),
    )
  }

  public async getAll(): Promise<Car[]> {
    return this.databaseConnection.transactional(tx =>
      this.carRepository.getAll(tx),
    )
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
    const licenseExists = await checkLicenseExists(_updates, this)
    if (licenseExists && _updates.licensePlate) {
      throw new DuplicateLicensePlateError(_updates.licensePlate)
    }
    const car = await this.get(_carId)
    const updatedCar = new Car({
      ...car,
      ..._updates,
      id: _carId,
    })
    if (_currentUserId === updatedCar.ownerId) {
      return this.databaseConnection.transactional(async tx => {
        return this.carRepository.update(tx, updatedCar)
      })
    }
    throw new UnauthorizedException(
      'User is not allowed to update a car that is not theirs.',
    )
  }
}
