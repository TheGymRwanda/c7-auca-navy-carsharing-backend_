import { type ICarTypeRepository } from './car-type.repository.interface'

export type CarTypeRepositoryMock = jest.Mocked<ICarTypeRepository>

export function mockCarTypeRepository(): CarTypeRepositoryMock {
  return {
    get: jest.fn(),
    getAll: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  }
}
