import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import {
  type CarID,
  CarNotFoundError,
  ICarService,
  FuelType,
  UserID,
  CarTypeID,
  CarState,
} from '../../application'
import { CarBuilder, UserBuilder } from '../../builders'
import {
  AuthenticationGuardMock,
  type CarServiceMock,
  mockCarService,
} from '../../mocks'
import { configureGlobalEnhancers } from '../../setup-app'
import { AuthenticationGuard } from '../authentication.guard'

import { CarController } from './car.controller'

describe('CarController', () => {
  const user = UserBuilder.from({
    id: 42,
    name: 'peter',
  }).build()

  const carOne = CarBuilder.from({
    id: 15,
    name: 'Car #15',
    ownerId: 15,
    carTypeId: 5,
  }).build()
  const carTwo = CarBuilder.from({
    id: 18,
    name: 'Car #18',
    ownerId: 8,
    carTypeId: 7,
  }).build()
  const carThree = CarBuilder.from({
    id: 22,
    name: 'Car #22',
    ownerId: 13,
    carTypeId: 9,
  }).build()

  let app: INestApplication
  let carServiceMock: CarServiceMock
  let authenticationGuardMock: AuthenticationGuardMock

  beforeEach(async () => {
    carServiceMock = mockCarService()
    authenticationGuardMock = new AuthenticationGuardMock(user)

    const moduleReference = await Test.createTestingModule({
      controllers: [CarController],
      providers: [
        {
          provide: ICarService,
          useValue: carServiceMock,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(authenticationGuardMock)
      .compile()

    app = moduleReference.createNestApplication()

    await configureGlobalEnhancers(app).init()
  })

  afterEach(() => app.close())

  describe('getAll', () => {
    it('should return all cars', async () => {
      carServiceMock.getAll.mockResolvedValue([carOne, carTwo, carThree])
      await request(app.getHttpServer())
        .get('/cars')
        .expect(HttpStatus.OK)
        .expect([
          {
            id: 15 as CarID,
            carTypeId: 5 as CarTypeID,
            state: CarState.LOCKED,
            name: 'Car #15',
            ownerId: 15 as UserID,
            fuelType: FuelType.PETROL,
            horsepower: 100,
            licensePlate: null,
            info: null,
          },
          {
            id: 18 as CarID,
            carTypeId: 7 as CarTypeID,
            state: CarState.LOCKED,
            name: 'Car #18',
            ownerId: 8 as UserID,
            fuelType: FuelType.PETROL,
            horsepower: 100,
            licensePlate: null,
            info: null,
          },
          {
            id: 22 as CarID,
            carTypeId: 9 as CarTypeID,
            state: CarState.LOCKED,
            name: 'Car #22',
            ownerId: 13 as UserID,
            fuelType: FuelType.PETROL,
            horsepower: 100,
            licensePlate: null,
            info: null,
          },
        ])
    })
  })

  describe('getOne', () => {
    it('should return a car', async () => {
      carServiceMock.get.mockResolvedValue(carOne)
      await request(app.getHttpServer())
        .get(`/cars/${carOne.id}`)
        .expect(HttpStatus.OK)
        .expect({
          id: 15 as CarID,
          carTypeId: 5 as CarTypeID,
          state: CarState.LOCKED,
          name: 'Car #15',
          ownerId: 15 as UserID,
          fuelType: FuelType.PETROL,
          horsepower: 100,
          licensePlate: null,
          info: null,
        })
    })

    it('should return a 400', async () => {
      await request(app.getHttpServer())
        .get(`/cars/bar`)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return a 404', async () => {
      const carId = 65 as CarID
      carServiceMock.get.mockRejectedValue(new CarNotFoundError(carId))
      await request(app.getHttpServer())
        .get(`/car/${carId}`)
        .expect(HttpStatus.NOT_FOUND)
    })
  })

  describe('create', () => {
    it('should create a new car', async () => {
      const newCar = new CarBuilder().withId(27).build()
      carServiceMock.create.mockResolvedValue(newCar)
      authenticationGuardMock.user = UserBuilder.from(user).build()

      await request(app.getHttpServer())
        .post(`/cars`)
        .send({
          carTypeId: newCar.id,
          name: newCar.name,
          ownerId: newCar.ownerId,
          state: newCar.state,
          fuelType: newCar.fuelType,
          horsepower: newCar.horsepower,
          licensePlate: newCar.licensePlate,
          info: newCar.info,
        })
        .expect(HttpStatus.CREATED)
        .expect({ ...newCar })

      expect(carServiceMock.create).toHaveBeenCalledWith({
        carTypeId: newCar.id,
        name: newCar.name,
        ownerId: newCar.ownerId,
        state: newCar.state,
        fuelType: newCar.fuelType,
        horsepower: newCar.horsepower,
        licensePlate: newCar.licensePlate,
        info: newCar.info,
      })
    })
  })

  describe('update', () => {
    it('should update an existing car', async () => {
      const car = new CarBuilder().withId(31).build()
      carServiceMock.update.mockResolvedValue(car)
      authenticationGuardMock.user = UserBuilder.from(user).build()
      await request(app.getHttpServer())
        .patch(`/cars/${car.id}`)
        .send({
          name: car.name,
          state: car.state,
          licensePlate: car.licensePlate,
          info: car.info,
        })
        .expect(HttpStatus.OK)
        .expect({ ...car })
    })
  })
})
