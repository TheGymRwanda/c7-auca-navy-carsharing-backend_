import {
  setupIntegrationTest,
  carTypes,
} from '../../jest.integration-test-setup'
import { type CarTypeID, CarTypeNotFoundError } from '../application'

import { CarTypeRepository } from './car-type.repository'

describe('CarTypeRepository', () => {
  const { execute } = setupIntegrationTest()

  let carTypeRepository: CarTypeRepository

  beforeEach(() => {
    carTypeRepository = new CarTypeRepository()
  })

  describe('getAll', () => {
    it('should return all car types', async () => {
      const actual = await execute(tx => carTypeRepository.getAll(tx))

      // We don't care about the order of the items, just that all of them are present. That's why we're using
      // "toIncludeSameMembers" instead of "toEqual".
      expect(actual).toIncludeSameMembers(Object.values(carTypes))
    })
  })

  describe('get', () => {
    it('should return a car type', async () => {
      const actual = await execute(tx =>
        carTypeRepository.get(tx, carTypes.fiat.id),
      )

      expect(actual).toEqual(carTypes.fiat)
    })

    it('should throw if a car type does not exist', async () => {
      await expect(
        execute(tx => carTypeRepository.get(tx, 99 as CarTypeID)),
      ).rejects.toThrow(CarTypeNotFoundError)
    })
  })

  describe('update', () => {
    it('should update a car type', async () => {
      const updated = { ...carTypes.fiat, name: 'Car 550 (updated)' }
      const actual = await execute(tx => carTypeRepository.update(tx, updated))

      expect(actual).toEqual(updated)
    })

    it('should throw if a car type does not exist', async () => {
      const updated = {
        id: 99 as CarTypeID,
        name: 'I do not exist',
        imageUrl: null,
      }
      await expect(
        execute(tx => carTypeRepository.update(tx, updated)),
      ).rejects.toThrow(CarTypeNotFoundError)
    })
  })
})
