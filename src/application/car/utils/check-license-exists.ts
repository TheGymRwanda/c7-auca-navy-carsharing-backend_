import { type Except } from 'type-fest'

import { type CarProperties } from '../car'
import { ICarService } from '../car.service.interface'

export default async function checkLicenseExists(
  _data: Except<CarProperties, 'id'> | Partial<Except<CarProperties, 'id'>>,
  carService: ICarService,
): Promise<boolean> {
  const licensePlate = _data.licensePlate
  const cars = await carService.getAll()
  const licenseExists = cars.find(car => {
    return car.licensePlate === licensePlate
  })
  return licenseExists ? true : false
}
