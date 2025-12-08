import {
  Body,
  Controller,
  Post,
  HttpStatus,
  HttpCode,
  Get,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import {
  AuthenticationError,
  IAuthenticationService,
  User,
} from '../../application'
import { AuthenticationGuard } from '../authentication.guard'
import { CurrentUser } from '../current-user.decorator'
import { UserDTO } from '../user'

import { LoginRequestDTO } from './login.request-dto'
import { LoginResponseDTO } from './login.response-dto'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *     ██╗     PROCEED WITH CAUTION                                                                                    *
 *     ██║                                                                                                             *
 *     ██║     This file implements some core functionality for the application. You will not need to modify or        *
 *     ╚═╝     fully understand this file to successfully finish your project.                                         *
 *     ██╗                                                                                                             *
 *     ╚═╝     That said, feel free to browse around and try things - you can always revert your changes!              *
 *                                                                                                                     *
 \*********************************************************************************************************************/

@ApiTags(User.name)
@ApiInternalServerErrorResponse({
  description: 'An internal server error occurred.',
})
@Controller('/auth')
export class AuthenticationController {
  private readonly authenticationService: IAuthenticationService

  public constructor(authenticationService: IAuthenticationService) {
    this.authenticationService = authenticationService
  }

  @ApiOperation({
    summary: 'Log in to the application.',
    description:
      'After successful authentication this endpoint returns a Json Web Token (JWT) with which the client can access the other endpoints provided by this server.',
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Authentication has failed, either because the user did not exist or the password was incorrect.',
  })
  @ApiCreatedResponse({
    description: 'Authentication was successful.',
    type: LoginResponseDTO,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  public async login(
    @Body() loginRequest: LoginRequestDTO,
  ): Promise<LoginResponseDTO> {
    try {
      const { user, token } =
        await this.authenticationService.authenticate(loginRequest)
      return LoginResponseDTO.create({ user, token })
    } catch (error: unknown) {
      if (error instanceof AuthenticationError) {
        // It would be better to not leak any information here, i.e. whether the user exists or the password is
        // incorrect. But for the developer experience it is nicer to have that level of detail in the response.
        throw new UnauthorizedException(error.message)
      }

      // Nest.js will turn this into an Internal Server Error, no need to map the exception here.
      throw error
    }
  }

  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Return information about the currently logged in user.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: UserDTO,
  })
  @ApiUnauthorizedResponse({
    description:
      'The request was not authorized because the JWT was missing, expired or otherwise invalid.',
  })
  @Get()
  public getUser(@CurrentUser() user: User): UserDTO {
    return UserDTO.fromModel(user)
  }
}
