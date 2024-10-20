import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './inputs/createUser.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { TMaybeTranaction } from 'src/prisma/types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserByUuid(uuid: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { uuid } });
  }

  async findUserByEmail(email: string): Promise<User> {
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
    data: any,
    prisma: TMaybeTranaction = this.prisma,
  ) {
    return await prisma.user.update({ where: { uuid: userUuid }, data });
  }
}
