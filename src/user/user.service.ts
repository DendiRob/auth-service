import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { CreateUserInput } from './inputs/create-user.input';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserById(id: number): Promise<User> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  // async createUser(userInput: CreateUserInput): Promise<User> {
  //   return await this.prisma.user.create({ data: userInput });
  // }
}
