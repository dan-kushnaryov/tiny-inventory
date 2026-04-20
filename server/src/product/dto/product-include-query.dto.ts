import { IsOptional, IsString, MaxLength, Validate } from 'class-validator';
import { IsProductIncludeListConstraint } from '../validators/is-product-include.constraint';

/** Detail query: optional `include` only (JSON:API-style). */
export class ProductIncludeQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Validate(IsProductIncludeListConstraint)
  include?: string;
}
