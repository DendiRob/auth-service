import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserInput } from './inputs/create-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { TMaybeTranaction } from 'src/prisma/types';
import { TUniqueUserFields, TUserUpdate } from './types/user.service.types';
import { ServiceError } from 'src/common/utils/throw-exception';
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
    userInput: CreateUserInput,
    prisma: TMaybeTranaction = this.prisma,
  ): Promise<User> {
    return await prisma.user.create({ data: userInput });
  }

  async updateUser(
    userUuid: string,
    data: Partial<TUserUpdate>,
    prisma: TMaybeTranaction = this.prisma,
  ) {
    return await prisma.user.update({ where: { uuid: userUuid }, data });
  }
}
