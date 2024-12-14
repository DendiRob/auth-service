import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TCreateSession, TUpdateSession } from './types';
import { TMaybeTranaction } from 'src/prisma/types';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class SessionService {
  // TODO: работу с токенами надо вынести в отдельный модуль или сервис
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  async createSession(
    sessionInfo: TCreateSession,
    prisma: TMaybeTranaction = this.prisma,
  ) {
    const { user_uuid, refresh_token, ip_address, user_agent } = sessionInfo;

    const decodedRefreshToken = this.tokenService.decodeToken(
      sessionInfo.refresh_token,
    );
    const refreshExpiresAt = new Date(decodedRefreshToken.exp * 1000);

    const sessionData = {
      user_uuid,
      refresh_token,
      refresh_expires_at: refreshExpiresAt,
      ip_address,
      user_agent,
    };

    return await prisma.session.create({ data: sessionData });
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
