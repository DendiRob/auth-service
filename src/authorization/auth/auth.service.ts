import { Injectable } from '@nestjs/common';
import { SessionService } from '@src/authorization/session/session.service';
import { UserService } from 'src/user/user.service';
import { TokenService } from 'src/token/token.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TSignUp } from './types/auth.service.types';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private sessionService: SessionService,
    private tokenService: TokenService,
  ) {}

  async refresh(oldRefreshToken: string, userUuid: string, userEmail: string) {
    const tokens = await this.tokenService.getTokens(userUuid, userEmail);

    const decodedRefreshToken = this.tokenService.decodeToken(
      tokens.refresh_token,
    );

    const refreshExpiresAt = new Date(decodedRefreshToken.exp * 1000);

    await this.sessionService.updateSessionByRefresh(oldRefreshToken, {
      refresh_expires_at: refreshExpiresAt,
      refresh_token: tokens.refresh_token,
    });

    return tokens;
  }

  async changePassword(userUuid: string, hashedNewPassword: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = this.userService.updateUser(
        { uuid: userUuid },
        { password: hashedNewPassword },
        tx,
      );

      await this.sessionService.closeAllUserSessions(userUuid);

      return user;
    });
  }

  async signUp(data: TSignUp) {
    return this.prisma.$transaction(async (tx) => {
      const user = await this.userService.createUser(data, tx);

      return user;
    });
  }
}
