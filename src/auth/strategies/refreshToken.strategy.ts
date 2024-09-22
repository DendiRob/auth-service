import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { GraphQLError } from 'graphql';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('refresh-token'),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(_: Request, payload: any) {
    return payload;
  }
}

@Injectable()
export class GqlRefreshTokenGuard extends AuthGuard('jwt-refresh') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (!user || info) {
      throw new GraphQLError('Данная сессия не найдена или закрыта', {
        extensions: { code: HttpStatus.UNAUTHORIZED },
      });
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
