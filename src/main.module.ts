import { Module } from '@nestjs/common'
import { ConfigModule as NestjsConfigModule } from '@nestjs/config'

import { ControllerModule, UtilityModule } from './module'

@Module({
  imports: [
    NestjsConfigModule.forRoot({ isGlobal: true }),
    UtilityModule,
    ControllerModule,
  ],
})
export class MainModule {}
