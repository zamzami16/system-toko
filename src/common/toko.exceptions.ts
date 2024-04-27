import { HttpException } from '@nestjs/common';

export class AlreadyExistsError extends HttpException {
  constructor(message: string = 'Data already exists.') {
    super(message, 400);
  }
}

export class NotFoundError extends HttpException {
  constructor(message: string = 'Not Found.') {
    super(message, 404);
  }
}
