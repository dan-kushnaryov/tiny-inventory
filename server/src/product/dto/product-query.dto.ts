import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  Validate,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IsProductIncludeListConstraint } from '../validators/is-product-include.constraint';

function emptyStringToUndefined({ value }: { value: unknown }): unknown {
  if (value === '' || value === null) {
    return undefined;
  }
  return value;
}

/**
 * List query: pagination, optional `include`, and optional filters
 * (`storeId`, `categoryId`, `minPrice` / `maxPrice`, `minStock` / `maxStock`).
 */
export class ProductQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Validate(IsProductIncludeListConstraint)
  include?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }): string | undefined => {
    if (typeof value !== 'string') {
      return undefined;
    }
    const t = value.trim();
    return t === '' ? undefined : t;
  })
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2_147_483_647)
  minStock?: number;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2_147_483_647)
  maxStock?: number;
}
