import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { User } from '@prisma/client';
import { TMaybeTranaction } from '@src/prisma/types';
import {
  TCreateUser,
  TUniqueUserFields,
  TUserUpdate,
} from './types/user.service.types';
import { ServiceError } from '@src/common/utils/throw-exception';
import USER_ERRORS from './constants/errors';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserByUnique(uniqueField: TUniqueUserFields): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: uniqueField });
  }

  async findActiveUserByUnique(
    uniqueField: TUniqueUserFields,
  ): Promise<User | ServiceError> {
    const user = await this.findUserByUnique(uniqueField);

    if (user === null || user.is_deleted) {
      return new ServiceError(HttpStatus.NOT_FOUND, USER_ERRORS.USER_NOT_FOUND);
    }

    return user;
  }

  async createUser(
    userData: TCreateUser,
    prisma: TMaybeTranaction = this.prisma,
  ): Promise<User> {
    return await prisma.user.create({ data: userData });
  }

  async updateUser(
    uniqueField: TUniqueUserFields,
    data: Partial<TUserUpdate>,
    prisma: TMaybeTranaction = this.prisma,
  ) {
    return await prisma.user.update({ where: uniqueField, data });
  }
}
