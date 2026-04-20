import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products.response.dto';
import { ProductIncludeQueryDto } from './dto/product-include-query.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto } from './dto/product.response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductExceptionFilter } from './filters/product-exception.filter';
import {
  toPaginatedProductsResponse,
  toProductResponseDto,
} from './mappers/product-response.mapper';
import { ProductService } from './product.service';
import { parseProductInclude } from './utils/parse-product-include';

@UseFilters(ProductExceptionFilter)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productService.create(dto);
    return toProductResponseDto(product, false);
  }

  @Get()
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    const { embedStore } = parseProductInclude(query.include);
    const paginated = await this.productService.findAll(query);
    return toPaginatedProductsResponse(paginated, embedStore);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ProductIncludeQueryDto,
  ): Promise<ProductResponseDto> {
    const { embedStore } = parseProductInclude(query.include);
    const product = await this.productService.findOne(id, query);
    return toProductResponseDto(product, embedStore);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productService.update(id, dto);
    return toProductResponseDto(product, false);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productService.remove(id);
  }
}
