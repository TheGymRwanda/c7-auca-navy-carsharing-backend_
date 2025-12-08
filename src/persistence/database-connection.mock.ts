import {
  type IDatabaseConnection,
  type Transaction,
} from './database-connection.interface'

export type DatabaseConnectionMock = jest.Mocked<IDatabaseConnection>

export const TX = Symbol('tx')

export function mockDatabaseConnection(
  tx: unknown = TX,
): DatabaseConnectionMock {
  return {
    transactional: jest
      .fn()
      .mockImplementation((callback: (_tx: Transaction) => Promise<unknown>) =>
        callback(tx as Transaction),
      ),
  }
}
