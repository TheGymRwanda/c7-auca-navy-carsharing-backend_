import { type ICarTypeService } from './car-type.service.interface'

export type CarTypeServiceMock = jest.Mocked<ICarTypeService>

export function mockCarTypeService(): CarTypeServiceMock {
  return {
    get: jest.fn(),
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }
}
