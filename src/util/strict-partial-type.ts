import { Type } from '@nestjs/common'
import {
  inheritPropertyInitializers,
  inheritValidationMetadata,
  inheritTransformationMetadata,
  MappedType,
} from '@nestjs/mapped-types'
import { RemoveFieldsWithType } from '@nestjs/mapped-types/dist/types/remove-fields-with-type.type'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *     ██╗     PROCEED WITH CAUTION                                                                                    *
 *     ██║                                                                                                             *
 *     ██║     This file uses some advanced features of Nest.js. You will not need to modify or fully understand       *
 *     ╚═╝     this file to successfully finish your project.                                                          *
 *     ██╗                                                                                                             *
 *     ╚═╝     That said, feel free to browse around and try things - you can always revert your changes!              *
 *                                                                                                                     *
 \*********************************************************************************************************************/

// This is basically the exact same thing as Nest.js' built-in "PartialType" except that it makes all properties
// truly optional (i.e., allowing 'undefined') - it does not also allow 'null'!

export function applyOptionalDecorator(
  // eslint-disable-next-line @typescript-eslint/ban-types
  targetClass: Function,
  propertyKey: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-var-requires
  const classValidator: typeof import('class-validator-extended') = require('class-validator-extended')
  const decoratorFactory = classValidator.Optional()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  decoratorFactory(targetClass.prototype, propertyKey)
}

export function StrictPartialType<T>(classRef: Type<T>) {
  abstract class PartialClassType {
    constructor() {
      inheritPropertyInitializers(this, classRef)
    }
  }

  const propertyKeys = inheritValidationMetadata(classRef, PartialClassType)
  inheritTransformationMetadata(classRef, PartialClassType)

  if (propertyKeys) {
    for (const key of propertyKeys) {
      applyOptionalDecorator(PartialClassType, key)
    }
  }

  Object.defineProperty(PartialClassType, 'name', {
    value: `Partial${classRef.name}`,
  })

  return PartialClassType as MappedType<
    // eslint-disable-next-line @typescript-eslint/ban-types
    RemoveFieldsWithType<Partial<T>, Function>
  >
}
