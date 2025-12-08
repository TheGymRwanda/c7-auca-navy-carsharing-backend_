import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { MainModule } from './main.module'
import { configureGlobalEnhancers, configureOpenAPI } from './setup-app'

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

async function bootstrap() {
  const port = Number.parseInt(process.env.PORT || '3000')
  const logger = new Logger()

  const app = await NestFactory.create(MainModule, {
    cors: true,
  })

  configureOpenAPI(app)
  configureGlobalEnhancers(app)

  await app.init()
  await app.listen(port)

  logger.log(`Server is listening on port ${port}`)
}
// eslint-disable-next-line unicorn/prefer-top-level-await
bootstrap().catch(error => {
  console.error(error)
  process.exitCode = 1
})
