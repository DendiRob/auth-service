import { HttpStatus, Inject, Injectable } from '@nestjs/common';
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
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findUserByUnique(uniqueField: TUniqueUserFields): Promise<User | null> {
    // TODO: Сделать обертку для работы с редис,чтобы не боилерплейтить в таком формате

    const cacheField = Object.entries(uniqueField)[0].join(':');
    const cacheKey = `user:${cacheField}`;

    const userFromCache: User | null = await this.cacheManager.get(cacheKey);

    if (userFromCache) return userFromCache;

    const user = await this.prisma.user.findUnique({ where: uniqueField });

    if (user) {
      await this.cacheManager.set(cacheKey, user, 300_000);
    }

    return user;
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
    const user = await prisma.user.update({ where: uniqueField, data });

    const cacheKeys = [`user:email:${user.email}`, `user:uuid:${user.uuid}`];

    await this.cacheManager.mdel(cacheKeys);
    return user;
  }
}
