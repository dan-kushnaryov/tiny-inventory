import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Catalog cap for units in stock (aligned with web app; column remains `integer`). */
export const PRODUCT_QUANTITY_STOCK_MAX = 999_999;

/** Max unit price in USD (aligned with web app; column remains `numeric(12,2)`). */
export const PRODUCT_PRICE_MAX = 999_999.99;

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsUUID()
  categoryId: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(PRODUCT_PRICE_MAX)
  /** Monetary amount; stored as decimal(12,2). */
  price: number;

  @IsInt()
  @Min(0)
  @Max(PRODUCT_QUANTITY_STOCK_MAX)
  @Type(() => Number)
  quantityInStock: number;

  @IsUUID()
  storeId: string;
}
