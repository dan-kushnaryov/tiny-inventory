import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isProductIncludeList } from '../utils/parse-product-include';

@ValidatorConstraint({ name: 'isProductIncludeList', async: false })
export class IsProductIncludeListConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isProductIncludeList(value);
  }

  defaultMessage(): string {
    return (
      'include must be empty or a comma-separated list of allowed relation ' +
      'names: store (alias: stores). Unknown values are not allowed.'
    );
  }
}
