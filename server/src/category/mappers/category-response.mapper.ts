import type { Category } from '../entities/category.entity';
import { CategoryResponseDto } from '../dto/category.response.dto';

export function toCategoryResponseDto(category: Category): CategoryResponseDto {
  const dto = new CategoryResponseDto();
  dto.id = category.id;
  dto.name = category.name;
  dto.createdAt = category.createdAt;
  dto.updatedAt = category.updatedAt;
  return dto;
}
