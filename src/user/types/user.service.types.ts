import { Prisma } from '@prisma/client';

export type TUniqueUserFields = Prisma.UserWhereUniqueInput;

export type TUserUpdate = {
  username: string;
  password: string;
  is_deleted: boolean;
  is_activated: boolean;
};

export type TCreateUser = {
  email: string;
  password: string;
  username?: string;
};
