import { NotFoundError } from '../not-found.error'

import { type CarID } from './car'

export class CarNotFoundError extends NotFoundError<CarID> {
  public constructor(carId: CarID) {
    super('Car not found', carId)
  }
}
