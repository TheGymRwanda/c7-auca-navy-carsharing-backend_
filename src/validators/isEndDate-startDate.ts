import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEndDateAfterStartDate', async: false })
export class IsEndDateAfterStartDate
  implements ValidatorConstraintInterface
{
  validate(endDate: string, args: ValidationArguments) {
    const startDate = (args.object as any).startDate;
    return new Date(endDate) > new Date(startDate);
  }

  defaultMessage() {
    return 'endDate must be after startDate';
  }
}
