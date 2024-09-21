import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createSessionInput } from './inputs/createSession.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}
  async createSession(
    sessionInfo: createSessionInput,
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    return await prisma.session.create({ data: sessionInfo });
  }
}
