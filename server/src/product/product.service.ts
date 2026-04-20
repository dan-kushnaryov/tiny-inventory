import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { QueryDeepPartialEntity } from 'typeorm';
import { Repository } from 'typeorm';
import type { PaginatedResult } from '../common/types/paginated-result';
import {
  resolvePagination,
  toPaginatedResult,
} from '../common/utils/pagination';
import { StoreService } from '../store/store.service';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductIncludeQueryDto } from './dto/product-include-query.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../category/entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductNotFoundException } from './exceptions/product-not-found.exception';
import { parseProductInclude } from './utils/parse-product-include';

function priceToNumericString(value: number): string {
  return value.toFixed(2);
}

function assertOrderedRange(
  min: number | undefined,
  max: number | undefined,
  name: string,
): void {
  if (min != null && max != null && max < min) {
    throw new BadRequestException(
      `${name}: upper bound must be greater than or equal to lower bound`,
    );
  }
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly storeService: StoreService,
  ) {}

  private async requireCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    return category;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    await this.storeService.findOne(dto.storeId);
    const category = await this.requireCategoryById(dto.categoryId);
    const product = this.productRepository.create({
      name: dto.name,
      category,
      price: priceToNumericString(dto.price),
      quantityInStock: dto.quantityInStock,
      storeId: dto.storeId,
    });
    const saved = await this.productRepository.save(product);
    return this.loadProduct(saved.id);
  }

  async findAll(query: ProductQueryDto): Promise<PaginatedResult<Product>> {
    assertOrderedRange(query.minPrice, query.maxPrice, 'price');
    assertOrderedRange(query.minStock, query.maxStock, 'quantityInStock');

    const { page, limit, skip } = resolvePagination(query);
    const { embedStore } = parseProductInclude(query.include);

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.name', 'ASC');

    // Category is required for API serialization; exclude rows with broken/null FK.
    qb.andWhere('category.id IS NOT NULL');

    if (embedStore) {
      qb.leftJoinAndSelect('product.store', 'store');
    }

    if (query.storeId) {
      qb.andWhere('product.storeId = :storeId', { storeId: query.storeId });
    }
    if (query.categoryId) {
      qb.andWhere('category.id = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.minPrice != null) {
      qb.andWhere('product.price >= :minPrice', {
        minPrice: priceToNumericString(query.minPrice),
      });
    }
    if (query.maxPrice != null) {
      qb.andWhere('product.price <= :maxPrice', {
        maxPrice: priceToNumericString(query.maxPrice),
      });
    }
    if (query.minStock != null) {
      qb.andWhere('product.quantityInStock >= :minStock', {
        minStock: query.minStock,
      });
    }
    if (query.maxStock != null) {
      qb.andWhere('product.quantityInStock <= :maxStock', {
        maxStock: query.maxStock,
      });
    }

    qb.skip(skip).take(limit);

    const [entities, total] = await qb.getManyAndCount();
    return toPaginatedResult(entities, total, page, limit);
  }

  async findOne(id: string, query: ProductIncludeQueryDto): Promise<Product> {
    const { relations } = parseProductInclude(query.include);
    return this.loadProduct(id, relations);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    if (dto.storeId !== undefined) {
      await this.storeService.findOne(dto.storeId);
    }

    const patch: QueryDeepPartialEntity<Product> = {};
    if (dto.name !== undefined) {
      patch.name = dto.name;
    }
    if (dto.price !== undefined) {
      patch.price = priceToNumericString(dto.price);
    }
    if (dto.quantityInStock !== undefined) {
      patch.quantityInStock = dto.quantityInStock;
    }
    if (dto.storeId !== undefined) {
      patch.storeId = dto.storeId;
    }
    if (dto.categoryId !== undefined) {
      const cat = await this.requireCategoryById(dto.categoryId);
      patch.category = { id: cat.id };
    }

    if (Object.keys(patch).length === 0) {
      return this.loadProduct(id);
    }
    const payload: QueryDeepPartialEntity<Product> = {
      ...patch,
      updatedAt: new Date(),
    };
    const result = await this.productRepository.update(id, payload);
    if (result.affected === 0) {
      throw new ProductNotFoundException(id);
    }
    return this.loadProduct(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new ProductNotFoundException(id);
    }
  }

  private async loadProduct(
    id: string,
    relations: string[] = [],
  ): Promise<Product> {
    const merged = [...new Set(['category', ...relations])];
    const product = await this.productRepository.findOne({
      where: { id },
      relations: merged,
    });
    if (!product) {
      throw new ProductNotFoundException(id);
    }
    return product;
  }
}
