import { type ICarRepository } from './car.repository.interface'

export type CarRepositoryMock = jest.Mocked<ICarRepository>

export function mockCarRepository(): CarRepositoryMock {
  return {
    findByLicensePlate: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  }
}
