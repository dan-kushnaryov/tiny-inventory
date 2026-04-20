import { PaginatedMetaResponseDto } from '../../common/dto/paginated-meta.response.dto';
import { ProductResponseDto } from './product.response.dto';

export class PaginatedProductsResponseDto {
  items!: ProductResponseDto[];
  meta!: PaginatedMetaResponseDto;
}
