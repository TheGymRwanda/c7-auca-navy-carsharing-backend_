import { JwtService } from '@nestjs/jwt'

import { UserBuilder } from '../../builders'
import { mockUserService, type UserServiceMock } from '../../mocks'

import { AuthenticationError, Reason } from './authentication.error'
import { AuthenticationService } from './authentication.service'

type JwtServiceMock = jest.Mocked<JwtService>

function mockJwtService(): JwtServiceMock {
  return {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  } as Partial<JwtServiceMock> as JwtServiceMock
}

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService
  let userServiceMock: UserServiceMock
  let jwtServiceMock: JwtServiceMock

  beforeEach(() => {
    userServiceMock = mockUserService()
    jwtServiceMock = mockJwtService()

    authenticationService = new AuthenticationService(
      userServiceMock,
      jwtServiceMock,
    )
  })

  describe('createJWT', () => {
    const user = UserBuilder.from({
      id: 42,
      name: 'Beatrice',
    }).build()

    it('should create a JWT', async () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      userServiceMock.findByName.mockResolvedValue(user)
      jwtServiceMock.sign.mockReturnValue(token)

      await expect(
        authenticationService.authenticate({
          username: user.name,
          password: 'password',
        }),
      ).resolves.toEqual({ user, token })

      expect(jwtServiceMock.sign).toHaveBeenCalledWith({ sub: user.id })
    })

    it('should fail if the user does not exist', async () => {
      userServiceMock.findByName.mockResolvedValue(null)

      await expect(
        authenticationService.authenticate({
          username: user.name,
          password: 'password',
        }),
      ).rejects.toThrow(new AuthenticationError(Reason.USER_NOT_FOUND))
    })

    it('should fail if the password did not match', async () => {
      userServiceMock.findByName.mockResolvedValue(user)

      await expect(
        authenticationService.authenticate({
          username: user.name,
          password: 'secret',
        }),
      ).rejects.toThrow(new AuthenticationError(Reason.INVALID_PASSWORD))
    })
  })
})
