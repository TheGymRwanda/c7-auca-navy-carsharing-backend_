import { type Dayjs } from 'dayjs'

// Testing things that rely on the current time can be notoriously difficult to test. Simply injecting a function that
// provides the current time makes that task significantly easier.

export abstract class ITimeProvider {
  abstract now(): Dayjs
}
