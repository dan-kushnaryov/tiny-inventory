import type { PaginatedResult } from '../../common/types/paginated-result';
import { toStoreResponseDto } from '../../store/mappers/store-response.mapper';
import { PaginatedProductsResponseDto } from '../dto/paginated-products.response.dto';
import { ProductResponseDto } from '../dto/product.response.dto';
import type { Product } from '../entities/product.entity';

function priceFromEntity(value: string): number {
  return Number.parseFloat(value);
}

export function toProductResponseDto(
  product: Product,
  embedStore: boolean,
): ProductResponseDto {
  const dto = new ProductResponseDto();
  dto.id = product.id;
  dto.name = product.name;
  dto.categoryId = product.category.id;
  dto.category = product.category.name;
  dto.price = priceFromEntity(product.price);
  dto.quantityInStock = product.quantityInStock;
  dto.createdAt = product.createdAt;
  dto.updatedAt = product.updatedAt;
  if (embedStore) {
    if (!product.store) {
      throw new Error(
        'Product.store must be loaded when serializing with embedStore',
      );
    }
    dto.store = toStoreResponseDto(product.store);
  } else {
    dto.storeId = product.storeId;
  }
  return dto;
}

export function toPaginatedProductsResponse(
  result: PaginatedResult<Product>,
  embedStore: boolean,
): PaginatedProductsResponseDto {
  const out = new PaginatedProductsResponseDto();
  out.items = result.items.map((p) => toProductResponseDto(p, embedStore));
  out.meta = result.meta;
  return out;
}
