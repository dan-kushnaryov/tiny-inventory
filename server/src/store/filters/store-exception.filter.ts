import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { StoreNotFoundException } from '../exceptions/store-not-found.exception';

@Catch(StoreNotFoundException)
export class StoreExceptionFilter implements ExceptionFilter {
  catch(exception: StoreNotFoundException, host: ArgumentsHost): void {
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
