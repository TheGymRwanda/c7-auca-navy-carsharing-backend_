import { createHash } from 'node:crypto'

import { UserBuilder } from '../../builders'
import {
  UserRepositoryMock,
  mockUserRepository,
  DatabaseConnectionMock,
  mockDatabaseConnection,
  TX,
} from '../../mocks'
import { Role } from '../authorization/role.enum'

import { UserService } from './user.service'

describe('UserService', () => {
  let userService: UserService
  let userRepositoryMock: UserRepositoryMock
  let databaseConnectionMock: DatabaseConnectionMock

  beforeEach(() => {
    userRepositoryMock = mockUserRepository()
    databaseConnectionMock = mockDatabaseConnection()

    userService = new UserService(userRepositoryMock, databaseConnectionMock)
  })

  describe('create', () => {
    const rawPassword = 'safe-password'
    const passwordHash = createHash('sha512').update(rawPassword).digest('hex')

    const userData = {
      name: 'Test User',
      password: rawPassword,
      role: Role.user,
    }

    it('should hash password and call repository insert', async () => {
      const createdUser = UserBuilder.from({
        name: userData.name,
        role: userData.role,
        passwordHash,
      }).build()

      userRepositoryMock.insert.mockResolvedValue(createdUser)

      const result = await userService.create(userData)

      expect(result).toBe(createdUser)
      expect(userRepositoryMock.insert).toHaveBeenCalledWith(TX, {
        name: userData.name,
        role: userData.role,
        passwordHash,
      })
    })
  })
})
