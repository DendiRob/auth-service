import {
  BadRequestException,
  ForbiddenException,
  GqlExceptionPattern,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@exceptions/gql-exceptions-shortcuts';

export class ExceptionFactory {
  static create(code: number, message?: string): GqlExceptionPattern {
    switch (code) {
      case 400:
        return new BadRequestException(message);
      case 404:
        return new NotFoundException(message);
      case 401:
        return new UnauthorizedException(message);
      case 403:
        return new ForbiddenException(message);
      default:
        return new HttpException(message);
    }
  }
}
