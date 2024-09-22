import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TCreateSession, TUpdateSession } from './types';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async createSession(
    sessionInfo: TCreateSession,
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    return await prisma.session.create({ data: sessionInfo });
  }

  // TODO: Надо сделать триггеры, которые будут записывать последенее обнолвние
  async updateSession(oldRefreshToken: string, data: TUpdateSession) {
    return await this.prisma.session.update({
      where: { refresh_token: oldRefreshToken },
      data,
    });
  }

  async getSessionByRefreshToken(refreshToken: string) {
    return await this.prisma.session.findUnique({
      where: { refresh_token: refreshToken },
    });
  }
}
