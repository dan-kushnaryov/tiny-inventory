import type { PaginatedResult } from '../../common/types/paginated-result';
import type { Store } from '../entities/store.entity';
import { PaginatedStoresResponseDto } from '../dto/paginated-stores.response.dto';
import { StoreResponseDto } from '../dto/store.response.dto';

export function toStoreResponseDto(store: Store): StoreResponseDto {
  const dto = new StoreResponseDto();
  dto.id = store.id;
  dto.name = store.name;
  dto.address = store.address;
  dto.createdAt = store.createdAt;
  dto.updatedAt = store.updatedAt;
  return dto;
}

export function toPaginatedStoresResponse(
  result: PaginatedResult<Store>,
): PaginatedStoresResponseDto {
  const out = new PaginatedStoresResponseDto();
  out.items = result.items.map(toStoreResponseDto);
  out.meta = result.meta;
  return out;
}
