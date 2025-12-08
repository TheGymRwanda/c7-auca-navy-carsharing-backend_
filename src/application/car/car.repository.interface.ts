import { type Except } from 'type-fest'

import { type Transaction } from '../../persistence/database-connection.interface'

import { type Car, type CarID, type CarProperties } from './car'

export abstract class ICarRepository {
  public abstract get(tx: Transaction, id: CarID): Promise<Car>

  public abstract getAll(tx: Transaction): Promise<Car[]>

  public abstract update(tx: Transaction, car: Car): Promise<Car>

  public abstract insert(
    tx: Transaction,
    car: Except<CarProperties, 'id'>,
  ): Promise<Car>

  public abstract findByLicensePlate(
    tx: Transaction,
    licensePlate: string,
  ): Promise<Car | null>
}
