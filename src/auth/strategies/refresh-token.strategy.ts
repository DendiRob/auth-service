import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { throwException } from 'src/common/utils/throw-exception';
import { TUserRequest } from '../types';
import SESSION_ERRORS from 'src/session/constants/errors';
import { extractCookie } from '@src/common/utils/cookies';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          extractCookie(req, process.env.REFRESH_TOKEN_NAME as string),
      ]),
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
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(
    err: unknown,
    user: TUserRequest,
    info: unknown,
    context: ExecutionContext,
  ) {
    if (!user) {
      throwException(
        HttpStatus.UNAUTHORIZED,
        SESSION_ERRORS.USER_SESSION_NOT_FOUND_OR_CLOSED,
      ) as never;
    }
    return super.handleRequest(err, user, info, context);
  }
}
