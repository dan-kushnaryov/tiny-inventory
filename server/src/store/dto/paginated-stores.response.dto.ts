import { PaginatedMetaResponseDto } from '../../common/dto/paginated-meta.response.dto';
import { StoreResponseDto } from './store.response.dto';

export class PaginatedStoresResponseDto {
  items!: StoreResponseDto[];
  meta!: PaginatedMetaResponseDto;
}
