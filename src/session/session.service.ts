import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TCreateSession, TUpdateSession } from './types';
import { TMaybeTranaction } from 'src/prisma/types';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async createSession(
    sessionInfo: TCreateSession,
    prisma: TMaybeTranaction = this.prisma,
  ) {
    return await prisma.session.create({ data: sessionInfo });
  }

  // TODO: Надо сделать триггеры, которые будут записывать последенее обнолвние
  async updateSession(refreshToken: string, data: TUpdateSession) {
    return await this.prisma.session.update({
      where: { refresh_token: refreshToken },
      data,
    });
  }

  async getSessionByRefreshToken(refreshToken: string) {
    return await this.prisma.session.findUnique({
      where: { refresh_token: refreshToken },
    });
  }
}
