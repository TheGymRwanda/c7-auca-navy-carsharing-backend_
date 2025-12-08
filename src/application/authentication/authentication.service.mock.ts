import { type IAuthenticationService } from './authentication.service.interface'

export type AuthenticationServiceMock = jest.Mocked<IAuthenticationService>

export function mockAuthenticationService(): AuthenticationServiceMock {
  return {
    authenticate: jest.fn(),
  }
}
