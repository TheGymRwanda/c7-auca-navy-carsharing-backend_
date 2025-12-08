import { NotFoundError } from '../not-found.error'

import { type CarTypeID } from './car-type'

export class CarTypeNotFoundError extends NotFoundError<CarTypeID> {
  public constructor(carTypeId: CarTypeID) {
    super('CarType not found', carTypeId)
  }
}
