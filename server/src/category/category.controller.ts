import { Controller, Get } from '@nestjs/common';
import { CategoryResponseDto } from './dto/category.response.dto';
import { toCategoryResponseDto } from './mappers/category-response.mapper';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(): Promise<CategoryResponseDto[]> {
    const rows = await this.categoryService.findAll();
    return rows.map((c) => toCategoryResponseDto(c));
  }
}
