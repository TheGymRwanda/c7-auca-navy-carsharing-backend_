import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import {
  AuthenticationError,
  IAuthenticationService,
  Reason,
} from '../../application'
import { UserBuilder } from '../../builders'
import {
  AuthenticationGuardMock,
  type AuthenticationServiceMock,
  mockAuthenticationService,
} from '../../mocks'
import { configureGlobalEnhancers } from '../../setup-app'
import { AuthenticationGuard } from '../authentication.guard'

import { AuthenticationController } from './authentication.controller'

describe('AuthenticationController', () => {
  const user = UserBuilder.from({
    id: 42,
    name: 'peter',
  }).build()

  let app: INestApplication
  let authenticationServiceMock: AuthenticationServiceMock

  beforeEach(async () => {
    authenticationServiceMock = mockAuthenticationService()

    const moduleReference = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: IAuthenticationService,
          useValue: authenticationServiceMock,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(new AuthenticationGuardMock(user))
      .compile()

    app = moduleReference.createNestApplication()
    await configureGlobalEnhancers(app).init()
  })

  afterEach(() => app.close())

  describe('getUser', () => {
    it('should return the current user', async () => {
      await request(app.getHttpServer())
        .get('/auth')
        .expect(HttpStatus.OK)
        .expect({
          id: user.id,
          name: user.name,
        })
    })
  })

  describe('login', () => {
    it('should succeed', async () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      authenticationServiceMock.authenticate.mockResolvedValue({ user, token })

      await request(app.getHttpServer())
        .post('/auth')
        .send({
          username: user.name,
          password: 'password',
        })
        .expect(HttpStatus.CREATED)
        .expect('content-type', /application\/json/)
        .expect({ userId: user.id, token })
    })

    it('should return 400', async () => {
      await request(app.getHttpServer())
        .post('/auth')
        .send({
          username: user.name,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect('content-type', /application\/json/)
    })

    it('should return 401', async () => {
      authenticationServiceMock.authenticate.mockRejectedValue(
        new AuthenticationError(Reason.INVALID_PASSWORD),
      )

      await request(app.getHttpServer())
        .post('/auth')
        .send({
          username: user.name,
          password: 'password',
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('content-type', /application\/json/)
    })
  })
})
