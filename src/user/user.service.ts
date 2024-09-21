import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './inputs/create-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

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
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<User> {
    return await prisma.user.create({ data: userInput });
  }
}
