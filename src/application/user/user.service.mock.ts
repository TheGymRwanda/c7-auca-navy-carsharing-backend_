import { type IUserService } from './user.service.interface'

export type UserServiceMock = jest.Mocked<IUserService>

export function mockUserService(): UserServiceMock {
  return {
    get: jest.fn(),
    getAll: jest.fn(),
    find: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
  }
}
