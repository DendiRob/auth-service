import { GqlExceptionPattern } from '@exceptions/gql-exceptions-shortcuts';
import { ExceptionFactory } from '../factories/exception-factory/ExceptionFactory';

export class ServiceError {
  code: number;
  msg: string;

  constructor(code: number, msg: string) {
    this.code = code;
    this.msg = msg;
  }
}

export function throwException(
  code: number,
  msg?: string,
): GqlExceptionPattern {
  throw ExceptionFactory.create(code, msg);
}
