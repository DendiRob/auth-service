import { GqlExceptionPattern } from '@exceptions/gql-exceptions-shortcuts';
import { Request } from 'express';
import { TUserRequest } from 'src/auth/types';

export type AuthenticatedRequest = Request & {
  user: TUserRequest;
};

export type GqlResponse<T> = T | GqlExceptionPattern;
