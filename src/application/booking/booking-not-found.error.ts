export class BookingNotFoundError extends Error {
  public constructor(id: number) {
    super(`Booking with id ${id} not found.`)
  }
}
