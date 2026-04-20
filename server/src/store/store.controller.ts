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
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { PaginatedStoresResponseDto } from './dto/paginated-stores.response.dto';
import { StoreResponseDto } from './dto/store.response.dto';
import { StoreStatsResponseDto } from './dto/store-stats.response.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreExceptionFilter } from './filters/store-exception.filter';
import {
  toPaginatedStoresResponse,
  toStoreResponseDto,
} from './mappers/store-response.mapper';
import { toStoreStatsResponseDto } from './mappers/store-stats-response.mapper';
import { StoreService } from './store.service';

@UseFilters(StoreExceptionFilter)
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  async create(@Body() dto: CreateStoreDto): Promise<StoreResponseDto> {
    const store = await this.storeService.create(dto);
    return toStoreResponseDto(store);
  }

  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedStoresResponseDto> {
    const paginated = await this.storeService.findAll(query);
    return toPaginatedStoresResponse(paginated);
  }

  @Get(':id/stats')
  async getStats(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StoreStatsResponseDto> {
    const snapshot = await this.storeService.getStoreStatsSnapshot(id);
    return toStoreStatsResponseDto(snapshot);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StoreResponseDto> {
    const store = await this.storeService.findOne(id);
    return toStoreResponseDto(store);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDto,
  ): Promise<StoreResponseDto> {
    const store = await this.storeService.update(id, dto);
    return toStoreResponseDto(store);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.storeService.remove(id);
  }
}
