import {
  validateSync,
  type ValidationError as ClassValidatorValidationError,
} from 'class-validator'
import { CustomError } from 'ts-custom-error'

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

export class ValidationError extends CustomError {
  public readonly cause: ClassValidatorValidationError | null

  public constructor(
    message: string,
    cause: ClassValidatorValidationError | null = null,
  ) {
    super(message)

    this.cause = cause
  }
}

export function validate<T extends object>(value: T): T {
  const errors = validateSync(value, {
    forbidUnknownValues: true,
    forbidNonWhitelisted: true,
  })

  if (errors.length > 0) {
    // Unfortunately, the objects in this list are not actually instances of Error. This means that Nest.js doesn't
    // display them nicely, sometimes even with an empty message which is super unhelpful.
    // As a workaround we wrap the first error that occurred in an actual Error and throw that.
    throw new ValidationError(
      errors[0].toString(false, false, undefined, true),
      errors[0],
    )
  }

  return value
}
