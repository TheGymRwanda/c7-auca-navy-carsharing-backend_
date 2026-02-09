import { MigrationBuilder } from 'node-pg-migrate'

export function up(pgm: MigrationBuilder): void {
  pgm.createType('booking_state', [
    'PICKED_UP',
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'RETURNED',
  ])

  pgm.createTable('bookings', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    car_id: {
      type: 'integer',
      references: 'cars',
    },
    state: {
      type: 'booking_state',
      notNull: true,
    },
    renter_id: {
      type: 'integer',
      references: 'users',
    },
    start_date: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    end_date: {
      type: 'TIMESTAMP',
      notNull: true,
    },
  })
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropTable('bookings')
}
