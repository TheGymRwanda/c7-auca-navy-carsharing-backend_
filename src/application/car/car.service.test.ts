import {
  type CarRepositoryMock,
  type DatabaseConnectionMock,
  mockCarRepository,
  mockDatabaseConnection,
} from '../../mocks'
import { UserBuilder } from '../user/user.builder'

import { CarBuilder } from './car.builder'
import { CarService } from './car.service'

describe('CarService', () => {
  let carService: CarService
  let carRepositoryMock: CarRepositoryMock
  let databaseConnectionMock: DatabaseConnectionMock

  beforeEach(() => {
    carRepositoryMock = mockCarRepository()
    databaseConnectionMock = mockDatabaseConnection()

    carService = new CarService(carRepositoryMock, databaseConnectionMock)
  })

  describe('create', () => {
    it('should create a car', async () => {
      const owner = new UserBuilder().build()
      const car = new CarBuilder().withOwner(owner).build()
      await expect(carService.create(car)).resolves.toEqual(car)
    })

    it('should should prevent users from creating a car with license that already exists', async () => {
      const newCar1 = new CarBuilder().withLicensePlate('TMO-4590').build()
      await carService.create(newCar1)
      const newCar2 = new CarBuilder().withLicensePlate('TMO-4590').build()
      await expect(carService.create(newCar2)).resolves.toReject()
    })
  })

  describe('update', () => {
    it('should update a car', async () => {
      const owner = new UserBuilder().build()
      const car = new CarBuilder().withOwner(owner).withHorsepower(50).build()
      const updatedCar = CarBuilder.from(car).withHorsepower(555).build()

      await expect(
        carService.update(car.id, { horsepower: 555 }, owner.id),
      ).resolves.toEqual(updatedCar)
    })

    it('should prevent users from updating a car that is not their own', async () => {
      const owner = new UserBuilder().withId(50).build()
      const car = new CarBuilder().withOwner(owner).withHorsepower(80).build()
      const updatedCar = CarBuilder.from(car).withHorsepower(85).build()

      await expect(
        carService.update(car.id, updatedCar, owner.id),
      ).resolves.toReject()
    })

    it('should prevent users from updating a car license', async () => {
      const owner = new UserBuilder().withId(20).build()
      const car = new CarBuilder()
        .withOwner(owner)
        .withHorsepower(70)
        .withLicensePlate('TMQ-72489')
        .build()
      const updatedCar = CarBuilder.from(car)
        .withLicensePlate('TMQ-72489')
        .build()

      await expect(
        carService.update(car.id, updatedCar, owner.id),
      ).resolves.toReject()
    })
  })
})
