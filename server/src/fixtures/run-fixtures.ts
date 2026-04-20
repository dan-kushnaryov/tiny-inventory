import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { Category } from '../category/entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { Store } from '../store/entities/store.entity';
import { StoreService } from '../store/store.service';
import { buildFixtureProductSeeds, FIXTURE_STORES } from './fixture-data';

const logger = new Logger('Fixtures');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const dataSource = app.get(DataSource);
    const storeTable = dataSource.getMetadata(Store).tableName;
    const productTable = dataSource.getMetadata(Product).tableName;
    const categoryTable = dataSource.getMetadata(Category).tableName;

    logger.warn(
      `Truncating "${productTable}", "${storeTable}", and "${categoryTable}" (CASCADE), then inserting fixtures.`,
    );
    await dataSource.query(
      `TRUNCATE TABLE "${productTable}", "${storeTable}", "${categoryTable}" RESTART IDENTITY CASCADE`,
    );

    const storeService = app.get(StoreService);
    const productService = app.get(ProductService);

    const stores: Store[] = [];
    for (const dto of FIXTURE_STORES) {
      stores.push(await storeService.create(dto));
    }

    const storeIds = stores.map((s) => s.id);
    const seeds = buildFixtureProductSeeds(storeIds);
    const categoryRepo = app.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
    const uniqueNames = [...new Set(seeds.map((s) => s.categoryName))].sort();
    const nameToId = new Map<string, string>();
    for (const name of uniqueNames) {
      const row = await categoryRepo.save(categoryRepo.create({ name }));
      nameToId.set(name, row.id);
    }
    for (const s of seeds) {
      await productService.create({
        name: s.name,
        categoryId: nameToId.get(s.categoryName)!,
        price: s.price,
        quantityInStock: s.quantityInStock,
        storeId: s.storeId,
      });
    }

    logger.log(
      `Seeded ${stores.length} stores and ${seeds.length} products (${uniqueNames.length} categories).`,
    );
  } finally {
    await app.close();
  }
}

void bootstrap().catch((err: unknown) => {
  logger.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exitCode = 1;
});
