import { Except } from 'type-fest'

import { type Transaction } from '../../persistence'

import { type CarType, type CarTypeID, CarTypeProperties } from './car-type'

export abstract class ICarTypeRepository {
  public abstract get(tx: Transaction, id: CarTypeID): Promise<CarType>

  public abstract getAll(tx: Transaction): Promise<CarType[]>

  public abstract update(tx: Transaction, carType: CarType): Promise<CarType>

  public abstract insert(
    tx: Transaction,
    properties: Except<CarTypeProperties, 'id'>,
  ): Promise<CarType>
}
