import { setupIntegrationTest, users } from '../../jest.integration-test-setup'
import { type UserID, UserNotFoundError } from '../application'

import { UserRepository } from './user.repository'

describe('UserRepository', () => {
  const { execute } = setupIntegrationTest()

  let userRepository: UserRepository

  beforeEach(() => {
    userRepository = new UserRepository()
  })

  describe('getAll', () => {
    it('should return all users', async () => {
      const actual = await execute(tx => userRepository.getAll(tx))

      expect(actual).toIncludeSameMembers(Object.values(users))
    })
  })

  describe('get', () => {
    it('should return a user', async () => {
      const actual = await execute(tx =>
        userRepository.get(tx, users.beatrice.id),
      )

      expect(actual).toEqual(users.beatrice)
    })

    it('should throw if a user does not exist', async () => {
      await expect(
        execute(tx => userRepository.get(tx, 99 as UserID)),
      ).rejects.toThrow(UserNotFoundError)
    })
  })

  describe('find', () => {
    it('should return a user', async () => {
      const actual = await execute(tx =>
        userRepository.find(tx, users.beatrice.id),
      )

      expect(actual).toEqual(users.beatrice)
    })

    it('should return null if a user does not exist', async () => {
      await expect(
        execute(tx => userRepository.find(tx, 99 as UserID)),
      ).resolves.toBeNull()
    })
  })
})
