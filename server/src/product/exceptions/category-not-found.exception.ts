import { DomainException } from '../../common/exceptions/domain.exception';

export class CategoryNotFoundException extends DomainException {
  readonly code = 'CATEGORY_NOT_FOUND' as const;

  constructor(public readonly categoryId: string) {
    super(`Category with id "${categoryId}" not found`);
  }
}
