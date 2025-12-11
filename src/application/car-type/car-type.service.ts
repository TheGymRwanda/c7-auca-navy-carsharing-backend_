import { Injectable, Logger } from '@nestjs/common'
import { Except } from 'type-fest'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'

import { CarType, type CarTypeID, CarTypeProperties } from './car-type'
import { ICarTypeRepository } from './car-type.repository.interface'
import { type ICarTypeService } from './car-type.service.interface'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

@Injectable()
export class CarTypeService implements ICarTypeService {
  private readonly carTypeRepository: ICarTypeRepository
  private readonly databaseConnection: IDatabaseConnection
  private readonly logger: Logger

  public constructor(
    carTypeRepository: ICarTypeRepository,
    databaseConnection: IDatabaseConnection,
  ) {
    this.carTypeRepository = carTypeRepository
    this.databaseConnection = databaseConnection

    // Typically we don't want to instantiate dependencies ourselves but use the Dependency Injection feature of
    // Nest.js. However, for the logger in particular, this is the idiomatic way of doing this. For more details
    // check out https://docs.nestjs.com/techniques/logger#using-the-logger-for-application-logging
    this.logger = new Logger(CarTypeService.name)
  }

  // It may look like the following methods are basically just duplicate code, they seemingly don't do anything useful.
  // In trivial use cases like these, that is a fair argument. However, this will change as the application evolves
  // and becomes more complex.
  //
  // The idea behind a service like this is to implement business use cases. Think about use cases that are nontrivial
  // because business logic is involved, multiple database requests are required or other services need to be called.
  // In those situations, that code has to live somewhere. It doesn't belong in the controller (because then your code
  // is not reusable, and it becomes much more difficult to test) and it also doesn't belong in the repository (because
  // you don't want repositories calling each other's methods, and you can't test or re-use your code without an actual
  // database).
  //
  // In other words: think of services as the core of the application where your logic sits. The controllers are just
  // an interface to the outside world, they are adapters to your business use cases. The repositories only load and
  // store data.

  // The code in this function is very verbose for explanatory purposes.
  public async getAll(): Promise<CarType[]> {
    // Calling the transactional() method starts a database transaction. The 'tx' parameter in the callback is then
    // used to do operations "inside" the transaction.
    // For more details see here: https://en.wikipedia.org/wiki/Database_transaction

    // You can use the logger to log noteworthy events or for debugging:
    this.logger.verbose('Loading all cars')

    const result = this.databaseConnection.transactional(async tx => {
      // We're now inside the transaction. The Promise returned from this function determines the fate of that
      // transaction: if it resolves, the transaction is committed and all changes are saved. If the promise
      // is rejected (i.e., an error occurred), no changes are saved.
      const cars = await this.carTypeRepository.getAll(tx)

      // If we were to throw an error here, e.g.
      //   throw new Error('Boom!')
      // the transaction would be aborted ("rolled back") and the error would bubble up to the caller of the function.
      // For a function that only reads data (but doesn't change anything) this doesn't make much of a difference. For
      // functions that consist of multiple database operations, however, this is an essential feature.

      // The return value of this callback becomes the return value of the call to transactional().
      return cars
    })

    return result
  }

  //only exception where the application layer has knowledge that there is a database layer.
  public async get(id: CarTypeID): Promise<CarType> {
    // This code does essentially the same thing as the code above (except that it returns one car type instead of many),
    // but it is written much more concisely.
    return this.databaseConnection.transactional(tx =>
      this.carTypeRepository.get(tx, id),
    )
  }

  public async update(
    carTypeId: CarTypeID,
    updates: Partial<Except<CarTypeProperties, 'id'>>,
  ): Promise<CarType> {
    return this.databaseConnection.transactional(async tx => {
      // Loading the car type first also checks that a car type with that id actually exists.
      const carType = await this.carTypeRepository.get(tx, carTypeId)

      // We're merging the current properties with the updated ones (in this order!) and, just to be on the safe side,
      // make sure that the correct id is set.
      const updatedCarType = new CarType({
        ...carType,
        ...updates,
        id: carTypeId,
      })

      return this.carTypeRepository.update(tx, updatedCarType)
    })
  }

  // When creating a car type, we don't allow an 'id' to be passed in (but require all other properties). The reason for
  // this is that the id is generated by the database.
  public async create(data: Except<CarTypeProperties, 'id'>): Promise<CarType> {
    return this.databaseConnection.transactional(tx =>
      this.carTypeRepository.insert(tx, data),
    )
  }
}
