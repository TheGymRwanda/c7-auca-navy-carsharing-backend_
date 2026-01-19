import { type Except } from 'type-fest'

import { type CarID } from '../car'
import { type UserID } from '../user'

import { Booking, type BookingID, type BookingProperties } from './booking'
import { BookingState } from './booking-state'

type UntaggedBookingProperties = Except<
  BookingProperties,
  'id' | 'carId' | 'renterId'
> & { id: number; carId: number; renterId: number }

export class BookingBuilder {
  private readonly properties: UntaggedBookingProperties = {
    id: 1 as BookingID,
    carId: 1 as CarID,
    renterId: 1 as UserID,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86_400_000),
    state: BookingState.PENDING,
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.properties[key] = value
      }
    }

    return this
  }

  public withId(id: number): this {
    this.properties.id = id
    return this
  }

  public withCarId(carId: number | CarID): this {
    this.properties.carId = carId as CarID
    return this
  }

  public withRenterId(renterId: number | UserID): this {
    this.properties.renterId = renterId as UserID
    return this
  }

  public withStartDate(startDate: Date): this {
    this.properties.startDate = startDate
    return this
  }

  public withEndDate(endDate: Date): this {
    this.properties.endDate = endDate
    return this
  }

  public withState(state: BookingState): this {
    this.properties.state = state
    return this
  }

  public build(): Booking {
    return new Booking({
      id: this.properties.id as BookingID,
      carId: this.properties.carId as CarID,
      renterId: this.properties.renterId as UserID,
      startDate: this.properties.startDate,
      endDate: this.properties.endDate,
      state: this.properties.state,
    })
  }
}
