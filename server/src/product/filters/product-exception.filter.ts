import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { StoreNotFoundException } from '../../store/exceptions/store-not-found.exception';
import { CategoryNotFoundException } from '../exceptions/category-not-found.exception';
import { ProductNotFoundException } from '../exceptions/product-not-found.exception';

@Catch(
  ProductNotFoundException,
  StoreNotFoundException,
  CategoryNotFoundException,
)
export class ProductExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | ProductNotFoundException
      | StoreNotFoundException
      | CategoryNotFoundException,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = HttpStatus.NOT_FOUND;
    res.status(status).json({
      statusCode: status,
      message: exception.message,
      error: 'Not Found',
      code: exception.code,
    });
  }
}
