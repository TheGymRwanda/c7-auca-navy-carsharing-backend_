import { type Except } from 'type-fest'

import { CarType, type CarTypeID, type CarTypeProperties } from './car-type'

type UntaggedCarTypeProperties = Except<CarTypeProperties, 'id'> & {
  id: number
}

export class CarTypeBuilder {
  private readonly properties: UntaggedCarTypeProperties = {
    id: 13 as CarTypeID,
    name: 'My CarType',
    imageUrl: null,
  }

  public static from(
    properties: CarType | Partial<UntaggedCarTypeProperties>,
  ): CarTypeBuilder {
    return new CarTypeBuilder().with(properties)
  }

  public with(properties: Partial<UntaggedCarTypeProperties>): this {
    let key: keyof UntaggedCarTypeProperties

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

  public withName(name: string): this {
    this.properties.name = name
    return this
  }

  public withImageUrl(imageUrl: string | null): this {
    this.properties.imageUrl = imageUrl
    return this
  }

  public build(): CarType {
    return new CarType({
      ...this.properties,
      id: this.properties.id as CarTypeID,
    })
  }
}
