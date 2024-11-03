import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ZodError } from 'zod';
import { Logger } from 'winston';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PRISMA_ERROR_CODES } from './prisma.error.codes';

@Catch(ZodError, HttpException, PrismaClientKnownRequestError)
export class ErrorFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const inProduction = process.env.NODE_ENV === 'production';

    this.logger.error(exception.message, JSON.stringify(exception));

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        errors: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        errors: 'Validation errors',
      });
    } else if (exception instanceof UnauthorizedException) {
      response.status(exception.getStatus()).json({
        errors: exception.getResponse(),
      });
    } else if (exception instanceof PrismaClientKnownRequestError) {
      if (
        exception.code ===
          PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT_VIOLATION ||
        exception.code === PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION
      ) {
        response.status(400).json({
          errors: inProduction ? 'Bad request' : exception.message,
        });
      } else {
        response.status(500).json({
          errors: inProduction ? 'Internal server error' : exception.message,
        });
      }
    } else {
      response.status(500).json({
        errors: exception.message,
      });
    }
  }
}
