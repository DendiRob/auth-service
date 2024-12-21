import { Prisma, User } from '@prisma/client';

export type TUniqueUserFields = Prisma.UserWhereUniqueInput;

export type TUserUpdate = {
  name: string;
  password: string;
  is_deleted: boolean;
  is_activated: boolean;
};
