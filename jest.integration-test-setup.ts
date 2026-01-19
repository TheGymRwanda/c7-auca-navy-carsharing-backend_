import * as assert from 'node:assert'
import { execFile as execFileCallback } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'

import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import * as glob from 'glob'
import pgPromise, { IDatabase } from 'pg-promise'

import {
  Booking,
  BookingID,
  Car,
  type CarID,
  CarState,
  CarType,
  type CarTypeID,
  FuelType,
  User,
  type UserID,
  BookingState
} from './src/application'
import { DatabaseConnectionConfig, type Transaction } from './src/persistence'

const execFile = promisify(execFileCallback)

const IMAGE_NAME = 'postgres:15-alpine'
const PG_MIGRATE = join(__dirname, 'node_modules', '.bin', 'node-pg-migrate')
const LOCAL_FIXTURE_DIR = join(__dirname, 'fixture')
const CONTAINER_FIXTURE_DIR = '/fixture'
const JEST_WORKER_ID = process.env.JEST_WORKER_ID ?? ''

const PASSWORD = 'postgres'
const USERNAME = 'postgres'

assert.match(JEST_WORKER_ID, /^\d+$/)

type Execute = <T>(callback: (tx: Transaction) => Promise<T>) => Promise<T>

export type IntegrationTestSetup = {
  execute: Execute
  getConfig: () => DatabaseConnectionConfig
}

// These objects mirror the data in the fixture. The purpose of this is to make the integration tests more concise and
// readable.
export const carTypes = {
  car550: new CarType({
    id: 1 as CarTypeID,
    name: `Car 550`,
    imageUrl: 'https://images.local/car-550.png',
  }),
  carPrime: new CarType({
    id: 2 as CarTypeID,
    name: `Car Prime`,
    imageUrl: 'https://images.local/car-prime.png',
  }),
  carCross: new CarType({
    id: 3 as CarTypeID,
    name: `Car Cross`,
    imageUrl: 'https://images.local/car-cross.png',
  }),
}

export const users = {
  beatrice: new User({
    id: 1 as UserID,
    name: 'Beatrice',
    passwordHash:
      'f38f5587a7dfb8c8f853b32f7235307c867cdd19109778a051891be5d8d4892cf2aa9a128d63409572f1d181d5aa77c0977ece42717aef7aa0506f61ed94fd7d',
  }),
  bob: new User({
    id: 2 as UserID,
    name: 'Bob',
    passwordHash:
      '19f58557744d2a919c47266f092e21dbe5fbfd7c930599033562420cb471abf4454442f4e097304523d462e7770a3fe2a0ac04e1e11a13a32932f1c0db886ffd',
  }),
  izzedin: new User({
    id: 3 as UserID,
    name: 'Izzedin',
    passwordHash:
      '3253659812d15922fe8c2d300fd7a7ce4466ddcdb6f24f52e83769d1ce32d43d124022e297693ff720c99fda96675f68843b054ac27f2efc7a6fc70096e256d4',
  }),
}

export const cars = {
  beatrice: new Car({
    id: 1 as CarID,
    ownerId: users.beatrice.id,
    carTypeId: carTypes.car550.id,
    name: `Beatrice's Car`,
    state: CarState.LOCKED,
    fuelType: FuelType.ELECTRIC,
    horsepower: 250,
    licensePlate: null,
    info: null,
  }),
  izzedin: new Car({
    id: 2 as CarID,
    ownerId: users.izzedin.id,
    carTypeId: carTypes.carCross.id,
    name: `Izzedin's Car`,
    state: CarState.LOCKED,
    fuelType: FuelType.PETROL,
    horsepower: 125,
    licensePlate: 'FOO-BAR 42',
    info: 'Please no scratches!',
  }),
}

export const bookings = {
  bob: new Booking({
    id: 1 as BookingID,
    carId: 2 as CarID,
    renterId: 2 as UserID,
    state: BookingState.PENDING,
    startDate: '2026-01-15 09:00:00',
    endDate: '2026-01-28 018:00:00',
  }),

  beatrice: new Booking({
    id: 2 as BookingID,
    carId: 3 as CarID,
    renterId: 1 as UserID,
    state: BookingState.PENDING,
    startDate: '2026-02-10 07:00:00',
    endDate: '2026-02-20 015:00:00',
  }),
}

export function setupIntegrationTest(): IntegrationTestSetup {
  const TEMPLATE_DATABASE = `test_template`
  const TEST_DATABASE = `test_${JEST_WORKER_ID}`

  let container: StartedPostgreSqlContainer
  let connection: IDatabase<unknown>

  jest.setTimeout(30_000)

  async function execute<T>(
    callback: (tx: Transaction) => Promise<T>,
  ): Promise<T> {
    return connection.tx(tx => callback(tx))
  }

  beforeAll(async () => {
    container = await new PostgreSqlContainer(IMAGE_NAME)
      .withUsername(USERNAME)
      .withPassword(PASSWORD)
      .withDatabase(TEMPLATE_DATABASE)
      .withExposedPorts(5432)
      .withBindMounts([
        {
          source: LOCAL_FIXTURE_DIR,
          target: CONTAINER_FIXTURE_DIR,
          mode: 'ro',
        },
      ])
      .start()

    await runMigrations(container)
    await loadFixture(container)

    await execSQL(
      container,
      `ALTER DATABASE ${TEMPLATE_DATABASE} WITH is_template TRUE`,
    )
  })

  beforeEach(async () => {
    await execSQL(container, [
      `DROP DATABASE IF EXISTS ${TEST_DATABASE}`,
      `CREATE DATABASE ${TEST_DATABASE} TEMPLATE ${TEMPLATE_DATABASE}`,
    ])

    connection = pgPromise()({
      application_name: 'integration-test',
      host: container.getHost(),
      database: TEST_DATABASE,
      port: container.getPort(),
      user: container.getUsername(),
      password: container.getPassword(),
      ssl: false,
    })
  })

  afterEach(() => connection?.$pool.end())

  afterAll(() => container?.stop())

  return {
    execute,
    getConfig: () =>
      new DatabaseConnectionConfig({
        host: container.getHost(),
        database: TEST_DATABASE,
        port: container.getPort(),
        username: container.getUsername(),
        password: container.getPassword(),
        ssl: false,
      }),
  }
}

async function exec(
  container: StartedPostgreSqlContainer,
  command: string | string[],
): Promise<void> {
  const { exitCode } = await container.exec(command)

  if (exitCode !== 0) {
    throw new Error(
      `Command failed with exit code ${exitCode}: "${
        Array.isArray(command) ? command.join(' ') : command
      }"`,
    )
  }
}

async function execSQL(
  container: StartedPostgreSqlContainer,
  statement: string | string[],
): Promise<void> {
  for (const command of Array.isArray(statement) ? statement : [statement]) {
    await exec(container, [
      'psql',
      '--user',
      container.getUsername(),
      '--command',
      command,
    ])
  }
}

async function loadFixture(
  container: StartedPostgreSqlContainer,
): Promise<void> {
  const files = await glob.glob('*.sql', {
    cwd: LOCAL_FIXTURE_DIR,
  })

  if (files.length === 0) {
    throw new Error(`No fixtures files found in ${LOCAL_FIXTURE_DIR}`)
  }

  for (const file of files.sort()) {
    await exec(
      container,
      `psql --username=${container.getUsername()} --dbname test_template --set ON_ERROR_STOP=1 -f ${CONTAINER_FIXTURE_DIR}/${file}`,
    )
  }
}

async function runMigrations(
  container: StartedPostgreSqlContainer,
): Promise<void> {
  await execFile(
    process.execPath,
    [
      '-r',
      'tsconfig-paths/register',
      PG_MIGRATE,
      '--config-file',
      'pgmigrate.config.json',
      'up',
    ],
    {
      cwd: __dirname,
      env: {
        DATABASE_URL: container.getConnectionUri(),
      },
      timeout: 10_000,
    },
  )
}
