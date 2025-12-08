import { type ICarService } from './car.service.interface'

export type CarServiceMock = jest.Mocked<ICarService>

export function mockCarService(): CarServiceMock {
  return {
    create: jest.fn(),
    getAll: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
  }
}
