import { Global, Module } from '@nestjs/common'
import dayjs from 'dayjs'

import { ITimeProvider } from '../application'

@Global()
@Module({
  providers: [
    {
      provide: ITimeProvider,
      useValue: {
        now() {
          return dayjs()
        },
      },
    },
  ],
  exports: [ITimeProvider],
})
export class UtilityModule {}
