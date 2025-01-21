import { Permission, User } from '@prisma/client';

export type TUserRequest = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
} & User & { permissions: Permission[] };
