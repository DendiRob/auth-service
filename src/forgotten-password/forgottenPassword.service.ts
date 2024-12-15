import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TForgottenPassword } from './types/forgottenPassword.types';

@Injectable()
export class ForgottenPasswordService {
  constructor(private prisma: PrismaService) {}

  async createForgottenPasswordSession(data: TForgottenPassword) {
    return await this.prisma.forgottenPassword.create({ data });
  }
}
