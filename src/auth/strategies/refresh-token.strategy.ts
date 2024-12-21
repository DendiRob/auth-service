import { UnauthorizedException } from '@exceptions/gql-exceptions-shortcuts';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader(
        process.env.REFRESH_TOKEN_HEADER as string,
      ),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  validate(_: Request, payload: any) {
    return payload;
  }
}

@Injectable()
export class GqlRefreshTokenGuard extends AuthGuard('jwt-refresh') {
  constructor(private sessionService: SessionService) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  // TODO: Что-то надо решать с такой реализацией, я не знаЮ, что именно может пойти не так, если риквест будет ассинхронным
  //@ts-ignore: asdasd
  async handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ) {
    if (!user) {
      const req = this.getRequest(context);
      const refresh = req.headers[process.env.REFRESH_TOKEN_HEADER as string];

      const session =
        await this.sessionService.getSessionByRefreshToken(refresh);

      if (session) {
        await this.sessionService.updateSession(refresh, {
          is_active: false,
        });
      }

      throw new UnauthorizedException('Данная сессия не найдена или закрыта');
    }
    return user;
  }
}
