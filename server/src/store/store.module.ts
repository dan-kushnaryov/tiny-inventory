import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { Store } from './entities/store.entity';
import { StoreExceptionFilter } from './filters/store-exception.filter';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Product])],
  controllers: [StoreController],
  providers: [StoreService, StoreExceptionFilter],
  exports: [TypeOrmModule, StoreService],
})
export class StoreModule {}
