import { DomainException } from '../../common/exceptions/domain.exception';

export class StoreNotFoundException extends DomainException {
  readonly code = 'STORE_NOT_FOUND' as const;

  constructor(public readonly storeId: string) {
    super(`Store with id "${storeId}" not found`);
  }
}
