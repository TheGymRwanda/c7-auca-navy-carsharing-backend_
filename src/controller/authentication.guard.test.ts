import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common'
import { type ModuleRef } from '@nestjs/core'
import { type JwtService } from '@nestjs/jwt'
import { type UnknownRecord } from 'type-fest'

import { AuthenticationConfig, IUserService } from '../application'
import { UserBuilder } from '../application/user/user.builder'
import {
  mockUserService,
  type UserServiceMock,
} from '../application/user/user.service.mock'

import { AuthenticationGuard } from './authentication.guard'

type RequestMock = UnknownRecord & { headers: UnknownRecord }
type ModuleReferenceMock = jest.Mocked<ModuleRef>
type JwtServiceMock = jest.Mocked<JwtService>
type ExecutionContextMock = jest.Mocked<ExecutionContext>

function mockModuleReference(): ModuleReferenceMock {
  return {
    get: jest.fn(),
    resolve: jest.fn(),
    introspect: jest.fn(),
    create: jest.fn(),
    registerRequestByContextId: jest.fn(),
  } as Partial<ModuleReferenceMock> as ModuleReferenceMock
}

function mockJwtService(): JwtServiceMock {
  return {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  } as Partial<JwtServiceMock> as JwtServiceMock
}

function mockExecutionContext(request: RequestMock): ExecutionContextMock {
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    }),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  }
}

describe('AuthenticationGuard', () => {
  const config = new AuthenticationConfig({
    jwtSecret: 'AAAABBBBCCCCDDDD',
  })

  let requestMock: RequestMock
  let moduleReferenceMock: ModuleReferenceMock
  let jwtServiceMock: JwtServiceMock
  let userServiceMock: UserServiceMock
  let executionContextMock: ExecutionContextMock
  let authenticationGuard: AuthenticationGuard

  beforeEach(() => {
    requestMock = { headers: {} }
    executionContextMock = mockExecutionContext(requestMock)
    moduleReferenceMock = mockModuleReference()
    jwtServiceMock = mockJwtService()
    userServiceMock = mockUserService()
    moduleReferenceMock.get.mockReturnValue(userServiceMock)

    authenticationGuard = new AuthenticationGuard(
      config,
      moduleReferenceMock,
      jwtServiceMock,
    )
  })

  afterEach(() => {
    expect(moduleReferenceMock.get).toHaveBeenCalledExactlyOnceWith(
      IUserService,
      { strict: false },
    )
  })

  describe('canActivate', () => {
    const user = new UserBuilder().build()
    const jwt = 'my-jwt'

    beforeEach(() => {
      requestMock.headers.authorization = `Bearer ${jwt}`
    })

    it('should return true', async () => {
      jwtServiceMock.verify.mockReturnValue({ sub: user.id })
      userServiceMock.find.mockResolvedValue(user)

      await expect(
        authenticationGuard.canActivate(executionContextMock),
      ).resolves.toBeTrue()

      expect(requestMock[AuthenticationGuard.USER_REQUEST_PROPERTY]).toBe(user)
    })

    it('should throw a ForbiddenException', async () => {
      jwtServiceMock.verify.mockReturnValue({ sub: user.id })
      userServiceMock.find.mockResolvedValue(null)

      await expect(
        authenticationGuard.canActivate(executionContextMock),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should throw a BadRequestException', async () => {
      const error = new Error('Boom!')
      jwtServiceMock.verify.mockImplementation(() => {
        throw error
      })

      await expect(
        authenticationGuard.canActivate(executionContextMock),
      ).rejects.toThrow(BadRequestException)
    })

    describe('should throw an UnauthorizedException', () => {
      it('if the header is missing', async () => {
        delete requestMock.headers.authorization

        await expect(
          authenticationGuard.canActivate(executionContextMock),
        ).rejects.toThrow(UnauthorizedException)
      })

      it('if the header is empty', async () => {
        requestMock.headers.authorization = 'Bearer '

        await expect(
          authenticationGuard.canActivate(executionContextMock),
        ).rejects.toThrow(UnauthorizedException)
      })

      it('if the header does not start with Bearer', async () => {
        requestMock.headers.authorization = 'Basic whatever'

        requestMock.headers.authorization = await expect(
          authenticationGuard.canActivate(executionContextMock),
        ).rejects.toThrow(UnauthorizedException)
      })
    })
  })
})
