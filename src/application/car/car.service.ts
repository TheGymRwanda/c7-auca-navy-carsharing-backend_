import { Injectable, Logger } from '@nestjs/common'
import { type Except } from 'type-fest'

import {
  IDatabaseConnection,
  Transaction,
} from '../../persistence/database-connection.interface'
import { AccessDeniedError } from '../access-denied.error'
import { IBookingService } from '../booking'
import { ICarTypeService } from '../car-type'
import { type UserID } from '../user'

import { Car, type CarID, type CarProperties } from './car'
import { ICarRepository } from './car.repository.interface'
import { type ICarService } from './car.service.interface'

@Injectable()
export class CarService implements ICarService {
  private readonly carRepository: ICarRepository
  private readonly databaseConnection: IDatabaseConnection
  private readonly carTypeService: ICarTypeService
  private readonly bookingService: IBookingService
  private readonly logger: Logger

  public constructor(
    carTypeService: ICarTypeService,
    carRepository: ICarRepository,
    databaseConnection: IDatabaseConnection,
    bookingService: IBookingService,
  ) {
    this.carRepository = carRepository
    this.databaseConnection = databaseConnection
    this.carTypeService = carTypeService
    this.bookingService = bookingService
    this.logger = new Logger(CarService.name)
  }

  // Please remove the next line when implementing this file.
  /* eslint-disable @typescript-eslint/require-await */

  public async create(_data: Except<CarProperties, 'id'>): Promise<Car> {
    await this.carTypeService.get(_data.carTypeId)
    return this.databaseConnection.transactional(async tx => {
      await this.checkLicenseExists(tx, _data.licensePlate)
      return this.carRepository.insert(tx, _data)
    })
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

  public async checkLicenseExists(
    _tx: Transaction,
    licensePlate: string | null,
  ) {
    if (licensePlate) {
      const licenseExists = await this.carRepository.findByLicensePlate(
        _tx,
        licensePlate,
      )
      return licenseExists
    }
  }

  public async isRenter(
    carId: CarID,
    renterId: UserID,
    updates: Partial<Except<CarProperties, 'id'>>,
  ) {
    const checkRenter = await this.bookingService.findRenterBooking(
      carId,
      renterId,
    )
    if (checkRenter !== null) {
      const checkIfPropertiesExceptStateExists =
        updates.info || updates.name || updates.licensePlate
      return checkIfPropertiesExceptStateExists ? false : true
    }
    return false
  }

  public async update(
    _carId: CarID,
    _updates: Partial<Except<CarProperties, 'id'>>,
    _currentUserId: UserID,
  ): Promise<Car> {
    return this.databaseConnection.transactional(async tx => {
      const car = await this.get(_carId)
      const updatedCar = new Car({
        ...car,
        ..._updates,
        id: _carId,
      })
      const checkRenter = await this.isRenter(_carId, _currentUserId, _updates)
      if (checkRenter) {
        return this.carRepository.update(tx, updatedCar)
      }
      if (_currentUserId !== updatedCar.ownerId) {
        throw new AccessDeniedError(car.name, car.id)
      }
      await this.checkLicenseExists(tx, car.licensePlate)
      return this.carRepository.update(tx, updatedCar)
    })
  }
}
