import { HttpStatus } from '@nestjs/common';
import { GraphQLError } from 'graphql';

abstract class GqlExceptionPattern extends GraphQLError {
  constructor(msg: string, code: number) {
    super(msg, { extensions: { code } });
  }
}

export class NotFoundException extends GqlExceptionPattern {
  constructor(msg: string = 'По данному запросу ничего не найдено') {
    super(msg, HttpStatus.NOT_FOUND);
  }
}

export class BadRequestException extends GqlExceptionPattern {
  constructor(msg: string = 'При отправке запроса что-то пошло не так') {
    super(msg, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedException extends GqlExceptionPattern {
  constructor(msg: string = 'Вы не авторизованы') {
    super(msg, HttpStatus.UNAUTHORIZED);
  }
}
