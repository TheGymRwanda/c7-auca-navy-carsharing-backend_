import { type User } from '../user'

export abstract class IAuthenticationService {
  public abstract authenticate(credentials: {
    username: string
    password: string
  }): Promise<{ user: User; token: string }>
}
