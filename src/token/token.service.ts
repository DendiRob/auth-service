import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TTokens } from './types/token.service.types';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async getTokens(userUuid: string, email: string): Promise<TTokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userUuid,
          email,
        },
        {
          expiresIn: Number(process.env.ACCESS_TOKEN_LIFE),
          secret: process.env.ACCESS_SECRET,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userUuid,
          email,
        },
        {
          expiresIn: Number(process.env.REFRESH_TOKEN_LIFE),
          secret: process.env.REFRESH_SECRET,
        },
      ),
    ]);
    return { access_token: at, refresh_token: rt };
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }
}
