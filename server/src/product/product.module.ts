import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category/category.module';
import { StoreModule } from '../store/store.module';
import { Product } from './entities/product.entity';
import { ProductExceptionFilter } from './filters/product-exception.filter';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CategoryModule, StoreModule],
  controllers: [ProductController],
  providers: [ProductService, ProductExceptionFilter],
  exports: [TypeOrmModule, ProductService],
})
export class ProductModule {}
