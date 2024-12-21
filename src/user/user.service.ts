import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './inputs/create-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { TMaybeTranaction } from 'src/prisma/types';
import { TUserUpdate } from './types/user.service.types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserByUuid(uuid: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { uuid } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { email } });
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
