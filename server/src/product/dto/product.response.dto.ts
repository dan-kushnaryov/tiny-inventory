import { StoreResponseDto } from '../../store/dto/store.response.dto';

/**
 * HTTP representation of a product. Either `storeId` (default) or nested
 * `store` is present, depending on the `include` query parameter.
 */
export class ProductResponseDto {
  id!: string;
  name!: string;
  /** FK to `categories.id`; use with list filter `categoryId`. */
  categoryId!: string;
  category!: string;
  /** Serialized as JSON number; stored in DB as `numeric` (string on the entity). */
  price!: number;
  quantityInStock!: number;
  createdAt!: Date;
  updatedAt!: Date;
  storeId?: string;
  store?: StoreResponseDto;
}
