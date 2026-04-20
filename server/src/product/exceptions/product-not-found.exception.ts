import { DomainException } from '../../common/exceptions/domain.exception';

export class ProductNotFoundException extends DomainException {
  readonly code = 'PRODUCT_NOT_FOUND' as const;

  constructor(public readonly productId: string) {
    super(`Product with id "${productId}" not found`);
  }
}
