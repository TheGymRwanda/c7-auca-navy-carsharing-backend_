/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder } from 'node-pg-migrate'

export function up(pgm: MigrationBuilder): void {
  pgm.createType('role', ['user', 'admin'])
  pgm.addColumn('users', {
    role: {
      type: 'role',
    },
  })
}
