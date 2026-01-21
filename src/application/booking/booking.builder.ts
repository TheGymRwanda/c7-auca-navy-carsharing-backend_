import { Except } from 'type-fest'

import { type CarID } from '../car'
import { type UserID } from '../user'

import { Booking, BookingID, BookingProperties } from './booking'
import { BookingState } from './booking-state'

type UntaggedBookingProperties = Except<
  BookingProperties,
  'id' | 'carId' | 'renterId'
> & { id: number; carId: CarID; renterId: UserID }

export class BookingBuilder {
  private readonly properties: UntaggedBookingProperties = {
    id: 14 as BookingID,
    carId: 2 as CarID,
    renterId: 1 as UserID,
    state: BookingState.PENDING,
    startDate: new Date('2025-12-15T07:00:00.000Z') as unknown as string,
    endDate: new Date('2026-01-15T07:00:00.000Z') as unknown as string,
  }

  public static from(
    properties: Booking | Partial<UntaggedBookingProperties>,
  ): BookingBuilder {
    return new BookingBuilder().with(properties)
  }

  public with(properties: Partial<UntaggedBookingProperties>): this {
    let key: keyof UntaggedBookingProperties

    for (key in properties) {
      const value = properties[key]

      if (value !== undefined) {
        if (key === 'startDate' || key === 'endDate') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.properties[key] = new Date(value as string)
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.properties[key] = value
        }
      }
    }

    return this
  }

  public withId(id: number): this {
    this.properties.id = id
    return this
  }

  public withCarId(id: CarID): this {
    this.properties.carId = id
    return this
  }

  public withRenterId(id: UserID): this {
    this.properties.renterId = id
    return this
  }

  public withState(state: BookingState): this {
    this.properties.state = state
    return this
  }

  public withStartDate(date: string | Date): this {
    this.properties.startDate = new Date(date) as unknown as string
    return this
  }

  public withEndDate(date: string | Date): this {
    this.properties.endDate = new Date(date) as unknown as string
    return this
  }

  public build(): Booking {
    return new Booking({
      ...this.properties,
      id: this.properties.id as BookingID,
      carId: this.properties.carId,
      renterId: this.properties.renterId,
    })
  }
}
