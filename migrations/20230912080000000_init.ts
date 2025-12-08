import { MigrationBuilder } from 'node-pg-migrate'

export function up(pgm: MigrationBuilder): void {
  pgm.createTable('users', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    name: {
      type: 'text',
      unique: true,
    },
    password: {
      type: 'text',
    },
  })

  pgm.createTable('car_types', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    name: {
      type: 'text',
    },
    image_url: {
      type: 'text',
      notNull: false,
    },
  })

  pgm.createTable('cars', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    car_type_id: {
      type: 'integer',
      references: 'car_types',
    },
    owner_id: {
      type: 'int',
      references: 'users',
      onDelete: 'CASCADE',
    },
    state: {
      type: 'text',
    },
    name: {
      type: 'text',
    },
    fuel_type: {
      type: 'text',
    },
    horsepower: {
      type: 'integer',
    },
    license_plate: {
      type: 'text',
      notNull: false,
      unique: true,
    },
    info: {
      type: 'text',
      notNull: false,
    },
  })
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropTable('cars')
  pgm.dropTable('car_types')
  pgm.dropTable('users')
}
