import { Request } from 'express';

export type TUserRequest = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

export type AuthenticatedRequest = Request & {
  user: TUserRequest;
};
