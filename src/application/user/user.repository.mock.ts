import { type IUserRepository } from './user.repository.interface'

export type UserRepositoryMock = jest.Mocked<IUserRepository>

export function mockUserRepository(): UserRepositoryMock {
  return {
    find: jest.fn(),
    findByName: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
  }
}
