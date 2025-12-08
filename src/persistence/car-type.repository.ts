import { Injectable } from '@nestjs/common'
import { Except } from 'type-fest'

import {
  CarType,
  type CarTypeID,
  CarTypeNotFoundError,
  CarTypeProperties,
  type ICarTypeRepository,
} from '../application'

import { type Transaction } from './database-connection.interface'

// This type defines what a row in the 'car_types' table looks like. There is no magic going on here, you have to
// manually update this if your database structure changes.
type Row = {
  id: number
  name: string
  image_url: string | null
}

// This helper function takes a row from the database and converts it to a domain object. Note that the instantiation
// of the car type object can fail with a validation error if the data in the database does not match.
// For instance, the domain object validates that a car type's name cannot be the empty string. This is not guaranteed
// by the database (although that could easily be added).
//
// When writing to the database via this repository, we check for that so there should be no issues. If, on the other
// hand, you manually add rows to the database that will not pass validation, you will never be able to load them
// via this repository.
function rowToDomain(row: Row): CarType {
  return new CarType({
    id: row.id as CarTypeID,
    name: row.name,
    imageUrl: row.image_url,
  })
}

@Injectable()
export class CarTypeRepository implements ICarTypeRepository {
  public async find(tx: Transaction, id: CarTypeID): Promise<CarType | null> {
    // The 'oneOrNone' method will throw an exception should the query return more than one result. Use this as an
    // additional safety net if you know that it can't (or shouldn't) happen. As a bonus, it also makes your TypeScript
    // types easier to work with.
    const maybeRow = await tx.oneOrNone<Row>(
      'SELECT * FROM car_types WHERE id = $(id)',
      {
        id,
      },
    )

    // Beware that TypeScript says 'maybeRow' is of type "Row | null" - but only because we told it so via the <Row>
    // type argument to the 'oneOrNone' method. There is no validation that the data returned from the query actually
    // is of the shape we claim it to be. So be careful.

    return maybeRow ? rowToDomain(maybeRow) : null
  }

  public async get(tx: Transaction, id: CarTypeID): Promise<CarType> {
    const carType = await this.find(tx, id)

    if (!carType) {
      // Note that we're *not* throwing a Nest.js "NotFoundException" because that is HTTP-specific - this repository
      // knows nothing about HTTP. The error thrown here is an application error (so not specific to either HTTP or
      // the database).
      throw new CarTypeNotFoundError(id)
    }

    return carType
  }

  public async getAll(tx: Transaction): Promise<CarType[]> {
    // 'any' here means 'any number of rows', it has no relations to the 'any' type of TypeScript.
    const rows = await tx.any<Row>('SELECT * FROM car_types')

    // This could be written more concisely with tx.map(...), but this is more explicit and slightly easier to read.
    // If you're interested, check out the docs here: https://vitaly-t.github.io/pg-promise/Database.html#map
    return rows.map(row => rowToDomain(row))
  }

  public async update(tx: Transaction, carType: CarType): Promise<CarType> {
    const row = await tx.oneOrNone<Row>(
      `
      UPDATE car_types SET
        name = $(name),
        image_url = $(imageUrl)
      WHERE
        id = $(id)
       RETURNING *`,
      { ...carType },
    )

    // The UPDATE statement does not fail if the WHERE-clause did not match any rows in the database (it will just not
    // do anything at all). However, if that happens that means that the user tried to update a car type with an id that
    // does not exist - which is most likely a bug. So that is why we throw an exception here.
    if (row === null) {
      throw new CarTypeNotFoundError(carType.id)
    }

    // We're creating our domain object from the actual values that are returned from the database (instead of from the
    // values passed to this function). The advantage of this is an additional layer of validation: we make extra sure
    // that whatever ends up in the database can safely be loaded and turned into a domain object.
    // Remember, the rowToDomain()-function validates the data. If it is not valid, an exception is thrown and the
    // transaction is aborted (i.e., nothing is persisted in the database!).
    return rowToDomain(row)
  }

  public async insert(
    tx: Transaction,
    properties: Except<CarTypeProperties, 'id'>,
  ): Promise<CarType> {
    const row = await tx.one<Row>(
      `
      INSERT INTO car_types (
        name,
        image_url
      ) VALUES (
        $(name),
        $(imageUrl)
      ) RETURNING *`,
      { ...properties },
    )

    return rowToDomain(row)
  }
}
