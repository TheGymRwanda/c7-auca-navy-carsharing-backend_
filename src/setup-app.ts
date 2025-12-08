import { type INestApplication, ValidationPipe } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import {
  AccessDeniedExceptionFilter,
  NotFoundExceptionFilter,
} from './controller'

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

export function configureOpenAPI(app: INestApplication): INestApplication {
  const config = new DocumentBuilder()
    .setTitle('CarSharing')
    .setDescription('The CarSharing API')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      bearerFormat: 'JWT',
    })
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  return app
}

export function configureGlobalEnhancers(
  app: INestApplication,
): INestApplication {
  const { httpAdapter } = app.get(HttpAdapterHost)

  return app
    .useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
      }),
    )
    .useGlobalFilters(new NotFoundExceptionFilter(httpAdapter))
    .useGlobalFilters(new AccessDeniedExceptionFilter(httpAdapter))
    .enableShutdownHooks()
}
