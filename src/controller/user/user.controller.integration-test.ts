import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { IUserService } from 'src/application'
import { Role } from 'src/application/authorization/role.enum'
import { UserBuilder } from 'src/builders'
import { configureGlobalEnhancers } from 'src/setup-app'

import {
  AuthenticationGuardMock,
  mockUserService,
  UserServiceMock,
} from '../../mocks'
import { AuthenticationGuard } from '../authentication.guard'

import { CreateUserDTO } from './create-user.dto'
import { UserController } from './user.controller'

describe('UserController', () => {
  const user = UserBuilder.from({
    id: 1,
    name: 'Admin User',
    role: Role.admin,
  }).build()

  let app: INestApplication
  let userServiceMock: UserServiceMock

  beforeEach(async () => {
    userServiceMock = mockUserService()

    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: IUserService,
          useValue: userServiceMock,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(new AuthenticationGuardMock(user))
      .compile()

    app = moduleRef.createNestApplication()
    await configureGlobalEnhancers(app).init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('create', () => {
    it('should create a user', async () => {
      const payload: CreateUserDTO = {
        name: 'New User',
        password: 'securePassword123!',
        role: Role.user,
      }

      const createdUser = UserBuilder.from({
        id: 2,
        name: payload.name,
        role: payload.role,
      }).build()

      userServiceMock.create.mockResolvedValue(createdUser)

      await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(HttpStatus.CREATED)
        .expect({
          id: 2,
          name: payload.name,
        })

      expect(userServiceMock.create).toHaveBeenCalledWith(payload)
    })

    it('should return 400 when name is missing', async () => {
      const payload = {
        password: 'securePassword123!',
        role: Role.user,
      }

      await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 400 when password is too short', async () => {
      const payload = {
        name: 'New User',
        password: '123',
        role: Role.user,
      }

      await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(HttpStatus.BAD_REQUEST)
    })
  })
})
