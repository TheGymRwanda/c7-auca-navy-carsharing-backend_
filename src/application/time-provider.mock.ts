import { Dayjs } from 'dayjs'

import { type ITimeProvider } from './time-provider.interface'

export type TimeProviderMock = jest.Mocked<ITimeProvider>

export function mockTimeProvider(now?: Dayjs): TimeProviderMock {
  return {
    now: jest.fn().mockReturnValue(now),
  }
}
